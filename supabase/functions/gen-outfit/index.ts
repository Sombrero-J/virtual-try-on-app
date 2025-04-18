import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { supabaseAdminClient } from '../_shared/supabaseAdmin.ts';
import { createErrorResponse } from '../_shared/utils.ts';
import { generateTryOn } from '../_shared/vto.ts';

// receive as input upperbody, lowerbody and model_url
// perform try on twice
// saves into outfits table (check if outfits table supports 2 clothings)

const MODEL_BUCKET_NAME = 'models';
const CLOTHING_BUCKET_NAME = 'clothings';
const TRYON_BUCKET_NAME = 'tryon';

Deno.serve(async (req) => {
	let body;
	try {
		body = await req.json();
	} catch (parseError) {
		return createErrorResponse(`Bad Request: Invalid JSON format. ${parseError}`, 400);
	}

	const { action, user_id, model_id } = body;

	if (!action || !user_id || !model_id) {
		console.error('Received:', body);
		return new Response(
			JSON.stringify({ error: 'Missing required fields: action, user_id, model_id' }),
			{ status: 400 }
		);
	}

	let new_outfit_id: number | undefined;
	let task_uuid: string | undefined;

	try {
		switch (action) {
			case 'combine': {
				console.log('Handling "combine" action...');
				const { base_try_on_url, overlay_clothing_id, existing_clothing_id, base_is_upper } = body;
				if (!base_try_on_url || !overlay_clothing_id || base_is_upper === undefined) {
					return new Response(JSON.stringify({ error: 'Missing fields for combine action' }), {
						status: 400
					});
				}

				// 1. Fetch overlay clothing image URL from DB using overlay_clothing_id & user_id

				console.log('Fetching overlay clothing image path from DB...');

				const { data: clothing_data, error: clothing_error } = await supabaseAdminClient
					.from('clothings')
					.select('front_image_url')
					.eq('id', overlay_clothing_id)
					.eq('user_id', user_id)
					.single();

				if (clothing_error) {
					console.error('Error fetching clothing data:', clothing_error);
					throw new Error(
						`Database Error: Failed to get model image details for ID ${overlay_clothing_id}. Reason: ${clothing_error.message}`
					);
				}

				const clothingPath = clothing_data.front_image_url;

				if (!clothingPath) {
					console.error(
						`Data Integrity Error: Model Image ${overlay_clothing_id} is missing image_url.`
					);
					throw new Error(
						`Data Integrity Error: Model Image ${overlay_clothing_id} is missing image_url.`
					);
				}

				// 2. Download overlay image from storage

				console.log('Downloading overlay clothing image from storage...');
				const { data: clothingBlob, error: clothingDownloadError } =
					await supabaseAdminClient.storage.from(CLOTHING_BUCKET_NAME).download(clothingPath);

				if (clothingDownloadError || !clothingBlob) {
					const status = clothingDownloadError?.message?.includes('Not Found') ? 404 : 500;
					throw new Error(
						`Storage Error (${status}): Failed to download clothing file '${overlay_clothing_id}'. Reason: ${clothingDownloadError?.message || 'Blob is null'}`
					);
				}

				const clothingContentType = clothingBlob.type || 'application/octet-stream';
				const clothingData: ArrayBuffer = await clothingBlob.arrayBuffer();
				console.log(
					`Edge Function: Clothing downloaded (${clothingData.byteLength} bytes, type: ${clothingContentType}).`
				);

				// 3. Download base image from base_try_on_url fetch from storage if it's a storage path

				console.log('Downloading base try-on image from storage...');
				const { data: tryOnBlob, error: tryOnDownloadError } = await supabaseAdminClient.storage
					.from(TRYON_BUCKET_NAME)
					.download(base_try_on_url);

				if (tryOnDownloadError || !tryOnBlob) {
					const status = tryOnDownloadError?.message?.includes('Not Found') ? 404 : 500;
					throw new Error(
						`Storage Error (${status}): Failed to download model file '${base_try_on_url}'. Reason: ${tryOnDownloadError?.message || 'Blob is null'}`
					);
				}

				const tryOnType = tryOnBlob.type || 'application/octet-stream';
				const tryOnData: ArrayBuffer = await tryOnBlob.arrayBuffer();
				console.log(
					`Edge Function: Model downloaded (${tryOnData.byteLength} bytes, type: ${tryOnType}).`
				);

				// Call database function that adds new rows to outfits and outfit_clothings table

				console.log('Creating new outfit in the database...');
				const { data: newOutfitId, error } = await supabaseAdminClient.rpc('create_new_outfit', {
					p_clothing_ids: [overlay_clothing_id, existing_clothing_id],
					p_user_id: user_id,
					p_cover_image_url: null,
					p_model_path: base_try_on_url,
					p_outfit_name: 'New Outfit'
				});

				if (error) {
					console.error('Error creating outfit:', error);
					throw new Error(
						`Database Function Error: Failed to create new outfit. Reason: ${error.message}`
					);
				}

				new_outfit_id = newOutfitId;

				if (!new_outfit_id) {
					console.error('Error: new_outfit_id is undefined.');
					throw new Error(
						'Data Integrity Error: new_outfit_id is undefined. Please check the database function.'
					);
				}

				console.log('New outfit created with ID:', newOutfitId);

				// 4. Call your image combination service/API/library

				const modelName = base_try_on_url.split('/').pop() || 'model_image'; // base try on is our model image
				const modelData = tryOnData;

				const clothingName = 'clothing_image';

				const categoryName = base_is_upper ? 'Shorts' : 'Shirts';

				const vtoInput = {
					modelName,
					clothingName,
					categoryName,
					modelData,
					clothingData
				};

				const dbInfo = {
					supabaseClient: supabaseAdminClient,
					try_on_session_id: null, // we don't have a try_on_session_id here
					outfits_id: new_outfit_id,
					user_id
				};

				console.log('Generating try-on with VTO service...');
				const { success, data, message } = await generateTryOn(vtoInput, dbInfo);

				if (!success || !data) {
					throw new Error(`VTO Generation Error: Failed to generate try-on. Reason: ${message}`);
				}

				console.log('VTO generation successful, updating outfits database...');
				const tryOnPath = data.tryOnPath;
				task_uuid = data.task_id;

				// 5. Upload the cover_image_url to tryOnPath in outfits table

				const { error: updateError } = await supabaseAdminClient
					.from('outfits')
					.update({ cover_image_url: tryOnPath, status: 'done', task_id: task_uuid })
					.eq('id', new_outfit_id);

				if (updateError) {
					console.error('Error updating outfit with cover image:', updateError);
					throw new Error(
						`Database Error: Failed to update outfit with cover image. Reason: ${updateError.message}`
					);
				}

				console.log('Outfit cover image updated successfully.');
				return new Response(
					JSON.stringify({
						success: true,
						message: 'Combination task processed.',
						data: tryOnPath
					}),
					{ status: 200 }
				);
			}

			case 'generate_both': {
				console.log('Handling "generate_both" action...');
				const { upper_clothing_id, lower_clothing_id } = body;
				if (!upper_clothing_id || !lower_clothing_id) {
					return new Response(
						JSON.stringify({ error: 'Missing fields for generate_both action' }),
						{ status: 400 }
					);
				}

				// --- Add your logic here ---
				// 1. Check if try_on_sessions exist for (upper_clothing_id, model_id, user_id)
				// 2. If not, create a new session record (status 'pending'/'queued') and trigger the *actual* VTO generation for it (e.g., call your VTO API, queue a job, etc.)
				// 3. Check if try_on_sessions exist for (lower_clothing_id, model_id, user_id)
				// 4. If not, create a new session record (status 'pending'/'queued') and trigger the *actual* VTO generation for it.
				// *Important*: This function likely shouldn't wait for the VTOs to complete. It just kicks them off.
				// Example placeholder:
				// await triggerSingleTryOnGeneration(upper_clothing_id, model_id, user_id);
				// await triggerSingleTryOnGeneration(lower_clothing_id, model_id, user_id);
				console.log(
					`Placeholder: Triggering generation for Upper ${upper_clothing_id} and Lower ${lower_clothing_id}`
				);
				// --- End of your logic ---

				return new Response(
					JSON.stringify({ success: true, message: 'Individual item generation tasks initiated.' }),
					{ status: 200 }
				);
			}

			default:
				console.warn(`Unknown action received: ${action}`);
				return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
					status: 400
				});
		}
	} catch (error) {
		// --- CENTRALIZED ERROR HANDLING ---
		console.error('Edge Function: An error occurred during processing:', error);

		if (supabaseAdminClient && new_outfit_id) {
			console.warn(
				`Edge Function: Attempting to update session ${new_outfit_id} status to 'error'.`
			);

			if (error instanceof Error) {
				const { error: updateDbError } = await supabaseAdminClient
					.from('outfits')
					.update({
						status: 'error',
						error: error.message, // Store the error message
						task_id: task_uuid
					})
					.eq('id', new_outfit_id);

				if (updateDbError) {
					console.error(
						`Edge Function CRITICAL: Failed to update session ${new_outfit_id} with error status: ${updateDbError.message}. Original error: ${error}`
					);
				}
			} else {
				const { error: updateDbError } = await supabaseAdminClient
					.from('outfits')
					.update({
						status: 'error',
						error: error, // Store the error message
						task_id: task_uuid
					})
					.eq('id', new_outfit_id);

				if (updateDbError) {
					console.error(
						`Edge Function CRITICAL: Failed to update session ${new_outfit_id} with error status: ${updateDbError.message}. Original error: ${error}`
					);
				}
			}
		} else {
			console.error(`Cannot update error status in DB.`);
		}

		return createErrorResponse(`Processing Error: ${error}`, 500);
	}
});
