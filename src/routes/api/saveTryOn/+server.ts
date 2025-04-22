import type { RequestHandler } from './$types';

// this is used for users who are not logged in when they try to save a tryon
export const POST: RequestHandler = async ({ request, locals: { supabase, user, session } }) => {
	if (!user || !session) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const body = await request.json();
		const sessionId = body.sessionId; // Access the property from the parsed object

		if (!sessionId || typeof sessionId !== 'string') {
			return new Response(
				JSON.stringify({ message: 'Bad Request: Missing or invalid sessionId' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const { data: cachedData, error: fetchCacheError } = await supabase
			.from('anonymous_try_on_cache')
			.select('*')
			.eq('session_token', sessionId)
			.single();

		if (fetchCacheError) {
			console.error(`Database error fetching cache for session ${sessionId}:`, fetchCacheError);
			return new Response(
				JSON.stringify({ message: 'Internal Server Error: Could not retrieve cached data.' }),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			);
		}

		if (!cachedData) {
			console.warn(`No cache entry found for session ID: ${sessionId}`);
			return new Response(
				JSON.stringify({
					message: `Not Found: No cached try-on found for this session ID. It may have expired or is invalid.`
				}),
				{ status: 404, headers: { 'Content-Type': 'application/json' } }
			);
		}

		console.log(`Cache entry found for session ID ${sessionId}:`, cachedData);

		// Check if the cache entry has expired
		const expiresAt = new Date(cachedData.expires_at);
		if (expiresAt <= new Date()) {
			console.warn(
				`Cache entry for session ID ${sessionId} has expired at ${cachedData.expires_at}`
			);
			// Consider deleting the expired entry here:
			// await supabase.from('anonymous_try_on_cache').delete().eq('session_token', sessionId);
			return new Response(
				JSON.stringify({ message: 'Gone: The cached try-on data has expired.' }),
				{ status: 410, headers: { 'Content-Type': 'application/json' } }
			);
		}

		if (cachedData.claimed) {
			console.warn(`Cache entry for session ID ${sessionId} has already been claimed.`);
			return new Response(
				JSON.stringify({ message: 'Conflict: This try-on has already been saved.' }),
				{ status: 409, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Validate essential fields retrieved from cache needed for the RPC
		// (Most are NOT NULL in table, but defensive check is good)
		const requiredFields: (keyof typeof cachedData)[] = [
			'try_on_path',
			'model_path',
			'clothing_path',
			'task_id',
			'clothing_name',
			'category',
			'clothing_description',
			'colors'
		];
		for (const field of requiredFields) {
			if (!cachedData[field]) {
				console.error(
					`Data Integrity Error: Cache entry ${sessionId} is missing required field '${field}'.`
				);
				return new Response(
					JSON.stringify({
						message: `Internal Server Error: Cached data is incomplete (missing ${field}).`
					}),
					{ status: 500, headers: { 'Content-Type': 'application/json' } }
				);
			}
		}

		console.log(`Validation passed for session ${sessionId}. Preparing data for save_tryon RPC...`);

		// Extract data from cache, mapping to RPC parameter names (p_*)
		const {
			clothing_name: p_clothing_name,
			task_id: p_task_id,
			clothing_path: p_clothing_image_url,
			model_path: p_model_image_url,
			try_on_path: p_try_on_image_url,
			clothing_description: p_description, // Can be null
			brand: p_brands, // Can be null
			colors: p_colors, // Can be null (text[])
			materials: p_materials, // Can be null (text[])
			category: p_category
		} = cachedData;

		const { data, error } = await supabase.rpc('save_tryon', {
			p_user_id: user.id,
			p_clothing_name,
			p_task_id,
			p_clothing_image_url,
			p_model_image_url,
			p_try_on_image_url,
			p_description,
			p_brands,
			p_colors,
			p_materials,
			p_category
		});

		if (error) {
			const buckets = [
				{ bucket: 'clothings', path: p_clothing_image_url },
				{ bucket: 'models', path: p_model_image_url },
				{ bucket: 'tryon', path: p_try_on_image_url }
			];

			for (const { bucket, path } of buckets) {
				const { error: delError } = await supabase.storage.from(bucket).remove([path]);
				if (delError) {
					console.error(`Failed to delete orphaned file from ${bucket}: ${delError.message}`);
				}
			}
			console.log('Error saving: ' + error.message + 'Rollback storage success.');
			return new Response(
				JSON.stringify({ message: `Internal Server Error: Failed to save the try-on data.` }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
		// If the RPC was successful, we can mark the cache entry as claimed
		const { error: updateCacheError } = await supabase
			.from('anonymous_try_on_cache')
			.update({ claimed: true }) // Mark as claimed
			.eq('session_token', sessionId);

		if (updateCacheError) {
			// Log this error but don't fail the request, as the main save was successful
			console.warn(`Failed to mark cache entry ${sessionId} as claimed:`, updateCacheError);
		} else {
			console.log(`Successfully marked cache entry ${sessionId} as claimed.`);
		}
		return new Response(
			JSON.stringify({
				success: true,
				message: 'Try-on saved successfully to your wardrobe.',
				newClothingId: data
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		if (error instanceof SyntaxError) {
			return new Response(JSON.stringify({ message: 'Bad Request: Invalid JSON format.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		console.error('Error processing save request:', error);
		return new Response(JSON.stringify({ message: `Internal Server Error: ${error}` }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
