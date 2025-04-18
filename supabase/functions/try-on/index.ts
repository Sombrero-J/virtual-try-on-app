import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
// import { corsHeaders } from '../_shared/cors.ts' // Uncomment if CORS needed
import { generateTryOn } from '../_shared/vto.ts';
import { createErrorResponse } from '../_shared/utils.ts';
import { supabaseAdminClient } from '../_shared/supabaseAdmin.ts';

const tops = ['T-Shirts', 'Long-Sleeve Tops', 'Shirts', 'Sweaters', 'Hoodies', 'Sleeveless'];
const bottoms = ['Jeans', 'Pants', 'Skirts', 'Shorts', 'Athletic Bottoms'];
const SUPPORTED_CATEGORIES = [...tops, ...bottoms];

// in production, add secrets from dashboard
// const BEAUTY_API = Deno.env.get('BEAUTY_API');
const MODEL_BUCKET_NAME = 'models';
const CLOTHING_BUCKET_NAME = 'clothings';

// --- Main Function Logic ---
Deno.serve(async (req) => {
	let try_on_session_id: number | undefined;
	let user_id: string | undefined;
	let task_uuid: string | undefined;

	try {
		// --- 2. Parse Request Body and Validate Input ---
		let body;
		try {
			body = await req.json();
		} catch (parseError) {
			return createErrorResponse(`Bad Request: Invalid JSON format. ${parseError}`, 400);
		}
		console.log('Edge Function: Request body parsed successfully.');

		//receive try_on_session id, get clothing_id and model_id. Then, get clothing_path, category, and model_path.
		// then, get clothing data, model data, and decide if it's "Upper body" or "Lower body".

		try_on_session_id = body.try_on_session_id;
		user_id = body.user_id;

		if (!try_on_session_id || !user_id) {
			return createErrorResponse(`Bad Request: Missing required fields in request body`, 400);
		}

		console.log("starting to update try_on_session status to 'processing'");
		const { error: updateProcessingError } = await supabaseAdminClient
			.from('try_on_sessions')
			.update({ status: 'processing' })
			.eq('id', try_on_session_id);
		console.log("updated try_on_session status to 'processing'");

		if (updateProcessingError) {
			// Log warning, but proceed if possible. Critical if subsequent steps rely on this status.
			console.warn(
				`Edge Function Warning: Failed to update session ${try_on_session_id} status to 'processing': ${updateProcessingError.message}`
			);
		}

		const { data: try_on_session_data_arr, error: try_on_session_error } = await supabaseAdminClient
			.from('try_on_sessions')
			.select('clothings_id, model_images_id')
			.eq('id', try_on_session_id)
			.maybeSingle(); // for potentially null result or single row

		if (try_on_session_error) {
			throw new Error(
				`Database Error: Failed to get try_on_session data. Reason: ${try_on_session_error.message}`
			);
		}

		if (!try_on_session_data_arr) {
			return createErrorResponse(
				`Not Found: Try-on session with ID ${try_on_session_id} not found.`,
				404
			);
		}

		const { clothings_id, model_images_id } = try_on_session_data_arr;
		if (!clothings_id || !model_images_id) {
			throw new Error(
				`Data Integrity Error: Session ${try_on_session_id} has missing clothings_id or model_images_id.`
			);
		}
		console.log(`Edge Function: Found Clothing ID: ${clothings_id}, Model ID: ${model_images_id}`);

		const { data: clothing_data, error: clothings_error } = await supabaseAdminClient
			.from('clothings')
			.select('name, front_image_url, categories(name)')
			.eq('id', clothings_id)
			.eq('user_id', user_id)
			.single();

		if (clothings_error) {
			throw new Error(
				`Database Error: Failed to get clothing details for ID ${clothings_id}. Reason: ${clothings_error.message}`
			);
		}

		if (!clothing_data) {
			console.log(`Clothing item with ID ${clothings_id} not found for user ${user_id}.`);
			// Decide how to handle: throw a specific "Not Found" error, return a 404 response, etc.
			throw new Error(`Clothing item not found or access denied.`);
			// Or: return new Response("Not Found", { status: 404 }); (if in an Edge Function context)
		}

		let clothingName = clothing_data.name;
		const clothingStoragePath = clothing_data.front_image_url;

		let categoryName: string | null = null; // Use a default or null

		if (clothing_data.categories) {
			// categories is only one item Categories:  { name: "Shirts" }
			categoryName = clothing_data.categories.name as string; // Assertion is safer now
		} else {
			throw new Error(
				`Clothing item ${clothings_id} has no associated category. ${clothing_data.categories}`
			);
			// Handle case where there's no category (e.g., assign a default, leave as null, etc.)
		}

		if (!clothingStoragePath || !categoryName) {
			throw new Error(
				`Data Integrity Error: Clothing ${clothings_id} is missing storage path or category.`
			);
		}

		if (!clothingName) {
			clothingName = 'nameless_clothing';
		}

		console.log(
			`Edge Function: Clothing Name: ${clothingName}, Path: ${clothingStoragePath}, Category: ${categoryName}`
		);

		// Validate Category (Case-insensitive check against supported list)
		if (!SUPPORTED_CATEGORIES.includes(categoryName)) {
			return createErrorResponse(
				`Bad Request: Category '${categoryName}' is not supported for try-on.`,
				400
			);
		}

		const { data: model_images_data, error: model_images_error } = await supabaseAdminClient
			.from('model_images')
			.select('image_url')
			.eq('id', model_images_id)
			.eq('user_id', user_id)
			.single();

		if (model_images_error) {
			throw new Error(
				`Database Error: Failed to get model image details for ID ${model_images_id}. Reason: ${model_images_error.message}`
			);
		}

		const modelStoragePath = model_images_data.image_url; // Renaming for consistency

		if (!modelStoragePath) {
			throw new Error(`Data Integrity Error: Model Image ${model_images_id} is missing image_url.`);
		}

		// --- 3. Download Files from Storage ---
		const { data: modelBlob, error: modelDownloadError } = await supabaseAdminClient.storage
			.from(MODEL_BUCKET_NAME)
			.download(modelStoragePath);

		if (modelDownloadError || !modelBlob) {
			const status = modelDownloadError?.message?.includes('Not Found') ? 404 : 500;
			throw new Error(
				`Storage Error (${status}): Failed to download model file '${modelStoragePath}'. Reason: ${modelDownloadError?.message || 'Blob is null'}`
			);
		}
		const modelContentType = modelBlob.type || 'application/octet-stream';
		const modelData: ArrayBuffer = await modelBlob.arrayBuffer(); // Declare type
		console.log(
			`Edge Function: Model downloaded (${modelData.byteLength} bytes, type: ${modelContentType}).`
		);

		console.log(
			`Edge Function: Downloading clothing from bucket '${CLOTHING_BUCKET_NAME}', path: ${clothingStoragePath}`
		);
		const { data: clothingBlob, error: clothingDownloadError } = await supabaseAdminClient.storage
			.from(CLOTHING_BUCKET_NAME) // Use defined constant
			.download(clothingStoragePath);

		if (clothingDownloadError || !clothingBlob) {
			const status = clothingDownloadError?.message?.includes('Not Found') ? 404 : 500;
			throw new Error(
				`Storage Error (${status}): Failed to download clothing file '${clothingStoragePath}'. Reason: ${clothingDownloadError?.message || 'Blob is null'}`
			);
		}
		const clothingContentType = clothingBlob.type || 'application/octet-stream';
		const clothingData: ArrayBuffer = await clothingBlob.arrayBuffer(); // Declare type
		console.log(
			`Edge Function: Clothing downloaded (${clothingData.byteLength} bytes, type: ${clothingContentType}).`
		);

		const modelName = modelStoragePath.split('/').pop() || 'model_image';
		// --- 4. Process with VTO APIs (Placeholders) ---

		const vtoInput = {
			modelName,
			clothingName,
			categoryName,
			modelData,
			clothingData
		};

		const dbInfo = {
			supabaseClient: supabaseAdminClient,
			try_on_session_id,
			outfits_id: null,
			user_id
		};

		const { success, data, message } = await generateTryOn(vtoInput, dbInfo);

		if (!success) {
			return createErrorResponse(message!, 500);
		} else {
			return new Response(
				JSON.stringify({
					success: true,
					message: 'Virtual try-on processing completed successfully.',
					try_on_url: data!.tryOnPath
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
	} catch (error) {
		// --- CENTRALIZED ERROR HANDLING ---
		console.error('Edge Function: An error occurred during processing:', error);

		if (supabaseAdminClient && try_on_session_id) {
			console.warn(
				`Edge Function: Attempting to update session ${try_on_session_id} status to 'error'.`
			);

			if (error instanceof Error) {
				const { error: updateDbError } = await supabaseAdminClient
					.from('try_on_sessions')
					.update({
						status: 'error',
						error: error.message, // Store the error message
						task_id: task_uuid
					})
					.eq('id', try_on_session_id);

				if (updateDbError) {
					console.error(
						`Edge Function CRITICAL: Failed to update session ${try_on_session_id} with error status: ${updateDbError.message}. Original error: ${error}`
					);
				}
			} else {
				const { error: updateDbError } = await supabaseAdminClient
					.from('try_on_sessions')
					.update({
						status: 'error',
						error: error, // Store the error message
						task_id: task_uuid
					})
					.eq('id', try_on_session_id);

				if (updateDbError) {
					console.error(
						`Edge Function CRITICAL: Failed to update session ${try_on_session_id} with error status: ${updateDbError.message}. Original error: ${error}`
					);
				}
			}
		} else {
			console.error(`Cannot update error status in DB.`);
		}
		return createErrorResponse(`Processing Error: ${error}`, 500);
	}
});
