import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getModels } from '$lib/server/database_helpers/queryDb';
import {
	FunctionsFetchError,
	FunctionsHttpError,
	FunctionsRelayError
} from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ locals: { user, supabase }, parent }) => {
	if (!user) {
		redirect(302, '/auth/login');
	}

	const user_id = user.id;

	const modelData = getModels(supabase, user_id);

	const backPath = '/outfits';
	const title = 'Customise outfit';
	const parentData = parent();

	return { title, backPath, parentData, modelData };
};

export const actions: Actions = {
	outfits: async ({ request, locals: { user, supabase } }) => {
		// const localsupabase = createClient("http://127.0.0.1:54321", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0");

		if (!user) {
			redirect(301, '/auth/login');
		}

		const user_id = user.id;

		const formData = await request.formData();
		const model_id = formData.get('model_path') as string;
		const upper_id = formData.get('upperBody') as string;
		const lower_id = formData.get('lowerBody') as string;

		if (!model_id || !upper_id || !lower_id) {
			return fail(400, {
				error: true,
				message: 'Missing required fields: Model, Upper Body, or Lower Body ID.'
			});
		}

		try {
			console.log('Checking existing outfit...');

			const { data: existingOutfitID, error: rpcCheckError } = await supabase.rpc(
				'find_outfit_id_by_combination',
				{
					p_item_id_1: Number(upper_id),
					p_item_id_2: Number(lower_id)
				}
			);

			if (rpcCheckError) {
				console.error('Error checking existing outfit:', rpcCheckError);
				return fail(500, {
					error: true,
					message: 'Database error checking existing outfits.'
				});
			}

			if (existingOutfitID) {
				// An outfit containing both these items for this user was found
				console.log(`Outfit combination already exists with ID: ${existingOutfitID}`);

				// Option 1: Return failure message
				return fail(409, {
					// 409 Conflict
					error: true,
					message: 'This outfit combination already exists.',
					data: {
						existingOutfitId: existingOutfitID
					}
				});

				// Option 2: Redirect to the existing outfit page (if applicable)
				// redirect(303, `/outfits/${existingOutfitData.id}`);
			}

			console.log('No existing outfit found. Proceeding with new outfit creation.');

			// 3. Check for existing Upper Body + Model VTO Session
			console.log(`Checking existing session for Upper ID ${upper_id} and Model ID ${model_id}`);

			const { data: upperSessionData, error: upperSessionError } = await supabase
				.from('try_on_sessions')
				.select('try_on_url, status')
				.eq('clothings_id', Number(upper_id))
				.eq('model_images_id', Number(model_id))
				.eq('user_id', user_id)
				.maybeSingle();

			if (upperSessionError) {
				console.error('Error checking upper body session:', upperSessionError);
				return fail(500, { error: true, message: 'Database error checking existing sessions.' });
			}

			// 4. Scenario A: Upper Body VTO exists and is 'done'
			if (upperSessionData && upperSessionData.status === 'done' && upperSessionData.try_on_url) {
				console.log(
					`Found completed Upper VTO session. URL: ${upperSessionData.try_on_url}. Triggering combine function.`
				);

				const body: invokeType = {
					supabase,
					action: 'combine',
					base_try_on_url: upperSessionData.try_on_url,
					overlay_clothing_id: Number(lower_id),
					existing_clothing_id: Number(upper_id),
					user_id: user_id,
					model_id: Number(model_id),
					base_is_upper: true, // Flag indicating the base is the upper body
					upper_clothing_id: null,
					lower_clothing_id: null
				};

				const { data: tryOnSignedUrl, error, message } = await generateOutfits(body);

				if (error) {
					return fail(502, {
						error: true,
						message
					});
				}

				console.log('Successfully invoked combine-outfit function (Upper Base).');

				if (!tryOnSignedUrl) {
					return fail(500, {
						error: true,
						message: 'No data returned from function.'
					});
				}

				return {
					success: true,
					message: 'Outfit successfully created.',
					data: tryOnSignedUrl
				};
			}
			console.log(`No 'done' session found for Upper. Checking lower body...`);

			// 5. Check for existing Lower Body + Model VTO Session (only if upper wasn't found/done)
			const { data: lowerSessionData, error: lowerSessionError } = await supabase
				.from('try_on_sessions')
				.select('try_on_url, status')
				.eq('clothings_id', Number(lower_id))
				.eq('model_images_id', Number(model_id))
				.eq('user_id', user_id)
				.maybeSingle();

			if (lowerSessionError) {
				console.error('Error checking lower body session:', lowerSessionError);
				return fail(500, { error: true, message: 'Database error checking existing sessions.' });
			}

			// 6. Scenario B: Lower Body VTO exists and is 'done'
			if (lowerSessionData && lowerSessionData.status === 'done' && lowerSessionData.try_on_url) {
				console.log(
					`Found completed Lower VTO session. URL: ${lowerSessionData.try_on_url}. Triggering edge function.`
				);

				const body: invokeType = {
					supabase,
					action: 'combine',
					base_try_on_url: lowerSessionData.try_on_url,
					overlay_clothing_id: Number(upper_id),
					existing_clothing_id: Number(lower_id),
					user_id: user_id,
					model_id: Number(model_id),
					base_is_upper: false, // Flag indicating the base is the lower body
					upper_clothing_id: null,
					lower_clothing_id: null
				};

				const { data: tryOnSignedUrl, error, message } = await generateOutfits(body);

				if (error) {
					return fail(502, {
						error: true,
						message
					});
				}

				console.log('Successfully invoked combine-outfit function (Upper Base).');

				if (!tryOnSignedUrl) {
					return fail(500, {
						error: true,
						message: 'No data returned from function.'
					});
				}

				return {
					success: true,
					message: 'Outfit successfully created.',
					data: tryOnSignedUrl
				};
			}
			console.log(`No 'done' session found for Lower ID.`);

			// 7. Scenario C: Neither Upper nor Lower VTO exists (or they aren't 'done')
			// Invoke edge function to generate the individual try-ons needed for the outfit
			console.log('Invoking generate-outfit-items function...');

			const body: invokeType = {
				supabase,
				action: 'generate_both',
				base_try_on_url: null,
				overlay_clothing_id: null,
				existing_clothing_id: null,
				user_id: user_id,
				model_id: Number(model_id),
				base_is_upper: null,
				upper_clothing_id: Number(upper_id),
				lower_clothing_id: Number(lower_id)
			};

			const { data: tryOnSignedUrl, error, message } = await generateOutfits(body);

			if (error) {
				return fail(502, {
					error: true,
					message
				});
			}

			console.log('Successfully invoked combine-outfit function (Upper Base).');

			if (!tryOnSignedUrl) {
				return fail(500, {
					error: true,
					message: 'No data returned from function.'
				});
			}

			return {
				success: true,
				message: 'Outfit successfully created.',
				data: tryOnSignedUrl
			};
		} catch (err) {
			console.error('Unexpected error in outfit action:', err);
			return fail(500, {
				error: true,
				message: `An unexpected server error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	tests: async ({ request, locals: { user, supabase } }) => {
		const { data: tryOnSignedUrl, error: tryOnDownloadError } = await supabase.storage
			.from('tryon')
			.createSignedUrl(
				'6ab87d5e-328e-4fe0-a094-b6f94eef43fb/3646a954-711f-4c73-83df-3303a0adb798.tryon_6ab87d5e-328e-4fe0-a094-b6f94eef43fb',
				60
			);

		if (tryOnDownloadError) {
			console.error('Error downloading try-on image:', tryOnDownloadError);
			return fail(500, {
				error: true,
				message: 'Failed to download try-on image.'
			});
		}

		if (!tryOnSignedUrl) {
			console.error('No try-on image found.');
			return fail(500, {
				error: true,
				message: 'No try-on image found.'
			});
		}

		return {
			success: true,
			message: 'Outfit successfully created.',
			data: tryOnSignedUrl
		};
	}
};

type invokeType = {
	supabase: supabaseFull;
	action: 'combine' | 'generate_both';
	base_try_on_url: string | null;
	overlay_clothing_id: number | null;
	existing_clothing_id: number | null;
	user_id: string; // user_id works with strings only
	model_id: number;
	base_is_upper: boolean | null;
	upper_clothing_id: number | null;
	lower_clothing_id: number | null;
};

async function generateOutfits(body: invokeType) {
	const {
		supabase,
		action,
		base_try_on_url,
		overlay_clothing_id,
		existing_clothing_id,
		user_id,
		model_id,
		base_is_upper,
		upper_clothing_id,
		lower_clothing_id
	} = body;
	let invokeResultData;
	let invokeError;
	if (action === 'combine') {
		const { data, error } = await supabase.functions.invoke('gen-outfit', {
			body: {
				action,
				base_try_on_url,
				overlay_clothing_id,
				existing_clothing_id,
				user_id,
				model_id,
				base_is_upper // Flag indicating the base is the upper body
			}
		});

		invokeResultData = data;
		invokeError = error;
	} else if (action === 'generate_both') {
		const { data, error } = await supabase.functions.invoke('gen-outfit', {
			body: {
				action,
				user_id,
				model_id,
				upper_clothing_id,
				lower_clothing_id
			}
		});
		invokeResultData = data;
		invokeError = error;
	}

	if (invokeError instanceof FunctionsHttpError) {
		const errorMessage = await invokeError.context.json();
		console.log('Function returned an error', errorMessage);
		return {
			data: null,
			error: true,
			message: `Failed to start outfit combination process: ${errorMessage}`
		};
	} else if (invokeError instanceof FunctionsRelayError) {
		console.log('Relay error:', invokeError.message);
		return {
			data: null,
			error: true,
			message: 'Relay error:' + invokeError.message
		};
	} else if (invokeError instanceof FunctionsFetchError) {
		console.log('Fetch error:', invokeError.message);
		return {
			data: null,
			error: true,
			message: 'Fetch error:' + invokeError.message
		};
	}

	console.log('Function invoked successfully:', invokeResultData);

	if (!invokeResultData) {
		return {
			data: null,
			error: true,
			message: 'No data returned from function.'
		};
	}

	const res = JSON.parse(invokeResultData);
	const tryOnPath = res.data as string;

	console.log('TryOnPath:', tryOnPath);

	const { data: tryOnSignedUrl, error: tryOnDownloadError } = await supabase.storage
		.from('tryon')
		.createSignedUrl(tryOnPath, 60);

	if (tryOnDownloadError) {
		console.error('Error downloading try-on image:', tryOnDownloadError);
		return {
			data: null,
			error: true,
			message: 'Failed to download try-on image.'
		};
	}

	if (!tryOnSignedUrl) {
		console.error('No try-on image found.');
		return {
			data: null,
			error: true,
			message: 'No try-on image found.'
		};
	}
	return { data: tryOnSignedUrl, error: false, message: 'Outfit successfully created.' };
}
