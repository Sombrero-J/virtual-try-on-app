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

				const { upper_clothing_id, lower_clothing_id, model_path } = body;

				if (!upper_clothing_id || !lower_clothing_id || !model_path) {
					return new Response(
						JSON.stringify({ error: 'Missing fields for generate_both action. Received: ', body }),
						{ status: 400 }
					);
				}

				let upperClothingData: ArrayBuffer | null = null;
				let lowerClothingData: ArrayBuffer | null = null;
				let upperCategoryName: string | null = null;
				let lowerCategoryName: string | null = null;

				const clothingIdsToProcess = [
					{ id: upper_clothing_id, type: 'upper' },
					{ id: lower_clothing_id, type: 'lower' }
				];

				// 1. Download both clothing images from storage with loop

				console.log('Downloading upper clothing image from storage...');

				for (const item of clothingIdsToProcess) {
					const clothingId = item.id;
					const itemType = item.type; // 'upper' or 'lower'

					console.log(`--- Start processing ${itemType} clothing (ID: ${clothingId}) ---`);

					// 1. Get image path from database
					console.log(`Fetching DB details for ${itemType} clothing ID: ${clothingId}`);
					const { data: clothingDbData, error: clothingDbError } = await supabaseAdminClient
						.from('clothings')
						.select('front_image_url, categories ( name )')
						.eq('id', clothingId)
						.eq('user_id', user_id) // Ensure user owns the clothing item
						.single();

					if (clothingDbError) {
						console.error(
							`Error fetching DB data for ${itemType} clothing ID ${clothingId}:`,
							clothingDbError
						);
						throw new Error(
							`Database Error: Failed to get ${itemType} image details for ID ${clothingId}. Reason: ${clothingDbError.message}`
						);
					}

					// Ensure data was actually returned (single() returns null if not found)
					if (!clothingDbData) {
						console.error(
							`Data Integrity Error: Clothing item ${clothingId} not found for user ${user_id}.`
						);
						throw new Error(
							`Data Integrity Error: Clothing item ${clothingId} not found or access denied.`
						);
					}

					const clothingPath = clothingDbData.front_image_url;
					const categoryName = clothingDbData.categories?.name;

					if (!clothingPath || !categoryName) {
						console.error(
							`Data Integrity Error: ${itemType} clothing ${clothingId} is missing storage path or category name.`
						);
						throw new Error(
							`Data Integrity Error: ${itemType} clothing ${clothingId} is missing its storage path (front_image_url) or category.`
						);
					}
					console.log(
						`Found storage path: ${clothingPath}, Category: ${categoryName} for ${itemType} clothing ID ${clothingId}`
					);

					// 2. Download image from storage
					console.log(`Downloading ${itemType} clothing image from storage path: ${clothingPath}`);
					const { data: clothingBlob, error: downloadError } = await supabaseAdminClient.storage
						.from(CLOTHING_BUCKET_NAME) // Use your defined constant
						.download(clothingPath);

					if (downloadError || !clothingBlob) {
						const status = downloadError?.message?.includes('Not Found') ? 404 : 500;
						console.error(
							`Storage Error (${status}) downloading ${itemType} clothing ID ${clothingId} from path '${clothingPath}':`,
							downloadError
						);
						throw new Error(
							`Storage Error (${status}): Failed to download ${itemType} clothing file '${clothingPath}'. Reason: ${downloadError?.message || 'Blob is null'}`
						);
					}

					// 3. Convert blob to ArrayBuffer
					const contentType = clothingBlob.type || 'application/octet-stream';
					const downloadedData: ArrayBuffer = await clothingBlob.arrayBuffer();
					console.log(
						`${itemType} clothing ID ${clothingId} downloaded successfully (${downloadedData.byteLength} bytes, type: ${contentType}).`
					);

					// 4. Assign data to the correct variable based on type
					if (itemType === 'upper') {
						upperClothingData = downloadedData;
						upperCategoryName = categoryName;
					} else if (itemType === 'lower') {
						lowerClothingData = downloadedData;
						lowerCategoryName = categoryName;
					}
					console.log(`--- Finished processing ${itemType} clothing (ID: ${clothingId}) ---`);
				}

				// 2. Get model data

				console.log('Downloading model image from storage...');
				const { data: modelBlob, error: modelDownloadError } = await supabaseAdminClient.storage
					.from(MODEL_BUCKET_NAME)
					.download(model_path);

				if (modelDownloadError || !modelBlob) {
					const status = modelDownloadError?.message?.includes('Not Found') ? 404 : 500;
					throw new Error(
						`Storage Error (${status}): Failed to download model file '${model_path}'. Reason: ${modelDownloadError?.message || 'Blob is null'}`
					);
				}
				const modelType = modelBlob.type || 'application/octet-stream';
				const modelData: ArrayBuffer = await modelBlob.arrayBuffer();
				console.log(
					`Edge Function: Model downloaded (${modelData.byteLength} bytes, type: ${modelType}).`
				);

				// 2. create new outfit in the database

				console.log('Creating new outfit in the database...');
				const { data: newOutfitId, error } = await supabaseAdminClient.rpc('create_new_outfit', {
					p_clothing_ids: [lower_clothing_id, upper_clothing_id],
					p_user_id: user_id,
					p_cover_image_url: null,
					p_model_path: model_path,
					p_outfit_name: 'New Full Outfit'
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

				console.log(
					`Placeholder: Triggering generation for Upper ${upper_clothing_id} and Lower ${lower_clothing_id}`
				);

				// 3. Apply try on for both clothing items

				if (
					!upperClothingData ||
					!lowerClothingData ||
					!upperCategoryName ||
					!lowerCategoryName ||
					!modelData
				) {
					console.error(
						'Loop/Setup finished but required data is missing (upper/lower data, categories, or model data).'
					);
					throw new Error(
						'Internal Server Error: Failed to retrieve all necessary data before VTO processing.'
					);
				}

				let upperBodyTryOnPath: string | null = null;
				let finalOutfitPath: string | null = null;
				let upperBodyTryOnData: ArrayBuffer | null = null;

				const modelName = model_path.split('/').pop() || 'model_image'; // base try on is our model image

				console.log('--- Step 1: Generating Upper Body Try-On ---');
				const upperVtoInput = {
					modelName: modelName,
					clothingName: `upper_${upper_clothing_id}`,
					categoryName: upperCategoryName,
					modelData: modelData,
					clothingData: upperClothingData
				};

				const dbInfo = {
					supabaseClient: supabaseAdminClient,
					try_on_session_id: null,
					outfits_id: new_outfit_id,
					user_id
				};

				console.log('Calling generateTryOn for upper body...');

				const upperResult = await generateTryOn(upperVtoInput, dbInfo);

				if (!upperResult.success || !upperResult.data?.tryOnPath) {
					throw new Error(
						`VTO Generation Error (Upper): Failed to generate try-on. Reason: ${upperResult.message || 'Unknown'}`
					);
				}

				upperBodyTryOnPath = upperResult.data.tryOnPath;

				// check if the path is valid
				if (!upperBodyTryOnPath) {
					console.error('Error: upperBodyTryOnPath is undefined.');
					throw new Error(
						'Data Integrity Error: upperBodyTryOnPath is undefined. Please check the VTO generation.'
					);
				}
				console.log(`Upper body VTO successful. Intermediate path: ${upperBodyTryOnPath}`);

				// --- Step 2: Download the Intermediate Upper Body Result ---

				console.log('--- Step 2: Downloading Intermediate Upper Body Result ---');

				const { data: tryOnBlob, error: tryOnDownloadError } = await supabaseAdminClient.storage
					.from('tryon')
					.download(upperBodyTryOnPath);

				if (tryOnDownloadError || !tryOnBlob) {
					const status = tryOnDownloadError?.message?.includes('Not Found') ? 404 : 500;
					console.error(
						`Failed to download intermediate VTO result "${upperBodyTryOnPath}"`,
						tryOnDownloadError
					);
					throw new Error(
						`Storage Error (${status}): Failed to download intermediate file '${upperBodyTryOnPath}'. Reason: ${tryOnDownloadError?.message || 'Blob is null'}`
					);
				}

				const intermediateContentType = tryOnBlob.type || 'application/octet-stream';
				upperBodyTryOnData = await tryOnBlob.arrayBuffer(); // Store the result as ArrayBuffer

				// Check if the data is valid

				if (!upperBodyTryOnData) {
					console.error('Error: upperBodyTryOnData is undefined.');
					throw new Error(
						'Data Integrity Error: upperBodyTryOnData is undefined. Please check the VTO generation.'
					);
				}

				console.log(
					`Intermediate VTO result downloaded (${upperBodyTryOnData.byteLength} bytes, type: ${intermediateContentType}).`
				);

				// --- Step 3: Generate Final Outfit using Intermediate Result + Lower Body ---
				console.log('--- Step 3: Generating Final Outfit (Intermediate + Lower Body) ---');
				const lowerVtoInput = {
					modelName: `intermediate_${upper_clothing_id}`, // Or derive from upperBodyTryOnPath
					clothingName: `lower_${lower_clothing_id}`,
					categoryName: lowerCategoryName,
					modelData: upperBodyTryOnData,
					clothingData: lowerClothingData
				};

				console.log('Calling generateTryOn for lower body...');
				const lowerResult = await generateTryOn(lowerVtoInput, dbInfo);

				if (!lowerResult.success || !lowerResult.data?.tryOnPath) {
					throw new Error(
						`VTO Generation Error (Lower): Failed to generate final outfit. Reason: ${lowerResult.message || 'Unknown'}`
					);
				}

				finalOutfitPath = lowerResult.data.tryOnPath; // This is the final result path!
				const task_uuid = lowerResult.data.task_id;

				// check if the path is valid
				if (!finalOutfitPath) {
					console.error('Error: finalOutfitPath is undefined.');
					throw new Error(
						'Data Integrity Error: finalOutfitPath is undefined. Please check the VTO generation.'
					);
				}

				console.log(`Final outfit VTO successful. Final path: ${finalOutfitPath}`);

				// --- Step 4: Update the 'outfits' table with the final path ---
				console.log('--- Step 4: Updating outfits table ---');

				const { error: updateOutfitError } = await supabaseAdminClient
					.from('outfits')
					.update({
						cover_image_url: finalOutfitPath,
						status: 'done',
						task_id: task_uuid
					})
					.eq('id', new_outfit_id)
					.eq('user_id', user_id);

				if (updateOutfitError) {
					// Log a warning but maybe don't fail the whole process if VTO succeeded
					console.warn(
						`Failed to update outfit record ${new_outfit_id} with final path: ${updateOutfitError.message}`
					);
				} else {
					console.log(
						`Outfit record ${new_outfit_id} updated successfully with path: ${finalOutfitPath}`
					);
				}

				// --- Return Success ---
				return new Response(
					JSON.stringify({
						success: true,
						message: 'Outfit generation successful.',
						data: finalOutfitPath
					}),
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
