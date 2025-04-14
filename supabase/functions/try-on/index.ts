import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
// import { corsHeaders } from '../_shared/cors.ts' // Uncomment if CORS needed
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@^2';

const tops = ['T-Shirts', 'Long-Sleeve Tops', 'Shirts', 'Sweaters', 'Hoodies', 'Sleeveless'];
const bottoms = ['Jeans', 'Pants', 'Skirts', 'Shorts', 'Athletic Bottoms'];
const SUPPORTED_CATEGORIES = [...tops, ...bottoms];

// in production, add secrets from dashboard
const BEAUTY_API = Deno.env.get('BEAUTY_API');
const MODEL_BUCKET_NAME = 'models';
const CLOTHING_BUCKET_NAME = 'clothings';
const POLLING_INTERVAL_MS = 8000; // 8 seconds
const MAX_POLLING_ATTEMPTS = 10;

function createErrorResponse(message: string, status: number = 500): Response {
	console.error(`Returning ${status} Error: ${message}`); // Log the error server-side
	return new Response(JSON.stringify({ success: false, message: message }), {
		status: status,
		headers: {
			'Content-Type': 'application/json'
			// ...corsHeaders // Include CORS headers if needed
		}
	});
}

// --- Main Function Logic ---
Deno.serve(async (req) => {
	let supabaseClient: SupabaseClient | undefined;
	let try_on_session_id: number | undefined;
	let user_id: string | undefined;
	let task_uuid: string | undefined;

	try {
		// --- 1. Initialize Supabase Client ---
		console.log('Edge Function: Initializing Supabase client...');
		// this works in deployment, but not locally
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		console.log('Read REMOTE_SUPABASE_URL:', supabaseUrl); // <-- ADD THIS
		const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

		if (!supabaseUrl || !serviceRoleKey) {
			return createErrorResponse(
				'Server configuration error: Missing Supabase environment variables.',
				500
			);
		}
		supabaseClient = createClient(supabaseUrl, serviceRoleKey);
		console.log('Edge Function: Supabase client initialized.');

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

		if (!try_on_session_id) {
			return createErrorResponse(`Bad Request: Missing required fields in request body`, 400);
		}

		console.log("starting to update try_on_session status to 'processing'");
		const { error: updateProcessingError } = await supabaseClient
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

		const { data: try_on_session_data_arr, error: try_on_session_error } = await supabaseClient
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

		const { data: clothing_data, error: clothings_error } = await supabaseClient
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

		const clothingName = clothing_data.name;
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

		if (!clothingStoragePath || !categoryName || !clothingName) {
			throw new Error(
				`Data Integrity Error: Clothing ${clothings_id} is missing storage path, name, or category link.`
			);
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

		const { data: model_images_data, error: model_images_error } = await supabaseClient
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
		const { data: modelBlob, error: modelDownloadError } = await supabaseClient.storage
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
		const { data: clothingBlob, error: clothingDownloadError } = await supabaseClient.storage
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

		// --- 4. Process with VTO APIs (Placeholders) ---
		try {
			console.log('Edge Function: Creating task with VTO API...');

			const modelName = modelStoragePath.split('/').pop() || 'model_image';
			const taskCreationResult = await createTask(modelName, clothingName, categoryName);
			console.log('Task creation result:', taskCreationResult);

			if (!taskCreationResult.success) {
				return createErrorResponse(
					`Task creation failed: ${taskCreationResult.error || 'Unknown error'}`,
					400
				);
			}

			task_uuid = taskCreationResult.task_uuid;
			const user_img_url = taskCreationResult.user_img_url;
			const cloth_img_url = taskCreationResult.cloth_img_url;

			if (user_img_url) {
				const fullBodyUploadResult = await uploadFullBodyImage(user_img_url, modelData);
				console.log('Full body upload result:', fullBodyUploadResult);
				if (!fullBodyUploadResult.success) {
					return createErrorResponse(
						// Added return
						`VTO API Error: Failed uploading body image - ${fullBodyUploadResult.error || 'Unknown error'}`,
						502
					);
				}
			} else {
				console.warn('Edge Function: No model upload URL provided by VTO API.');
			}

			if (cloth_img_url) {
				const clothingUploadResult = await uploadClothingImage(cloth_img_url, clothingData);
				console.log('Clothing upload result:', clothingUploadResult);
				if (!clothingUploadResult.success) {
					return createErrorResponse(
						// Added return
						`VTO API Error: Failed uploading clothing image - ${clothingUploadResult.error || 'Unknown error'}`,
						502
					);
				}
			} else {
				console.warn('Edge Function: No clothing upload URL provided by VTO API.');
			}

			if (task_uuid) {
				const { success, error } = await submitTask(task_uuid);
				if (!success)
					return createErrorResponse(`Task submission failed: ${error || 'Unknown error'}`, 400);

				let result = await tryOnResult(task_uuid);
				if (!result.success) {
					// Early return if initial API call fails
					createErrorResponse(`Failed to fetch task info: ${result.error || 'Unknown error'}`, 400);
				}

				let currentStatus = result.status;
				console.log('Initial Status:', currentStatus);

				let attempts = 0;
				// Poll until the task is either "successed" or "failed"
				while (currentStatus !== 'successed' && currentStatus !== 'failed') {
					if (attempts++ >= MAX_POLLING_ATTEMPTS) {
						console.error('Polling timed out after maximum attempts');
						return createErrorResponse(
							'Task timed out after maximum polling attempts.',
							408 // Request Timeout
						);
					}

					await delay(POLLING_INTERVAL_MS);

					result = await tryOnResult(task_uuid);
					if (!result.success) {
						return createErrorResponse(
							`Failed to fetch task info: ${result.error || 'Unknown error'}`,
							400
						);
					}

					currentStatus = result.status;
					console.log('Polled Status:', currentStatus);
				}

				if (currentStatus === 'successed') {
					const tryonUrl = result.data;
					console.log('Task succeeded with URL:', tryonUrl);

					// store the tryonUrl in the "tryon" storage bucket
					if (!tryonUrl) {
						return createErrorResponse(`No try-on URL returned from API.`, 502);
					}

					const tryonFile = await getImageData(tryonUrl, `tryon_${user_id}`);
					const tryonPath = await uploadToStorage(
						'tryon',
						tryonFile,
						supabaseClient,
						user_id
					);

					if (!tryonPath) {
						return createErrorResponse(`Failed to upload try-on image.`, 502);
					}
					console.log('Try-on image uploaded to storage:', tryonPath);

					// Update the "status" column of try_on_sessions to "done", and save the try on images

					const { error: updateSuccessError } = await supabaseClient
						.from('try_on_sessions')
						.update({
							status: 'done',
							try_on_url: tryonPath,
							task_id: task_uuid
						})
						.eq('id', try_on_session_id);

					if (updateSuccessError) {
						// Log error but still return success to client as VTO finished
						console.error(
							`Edge Function WARNING: Failed to update session ${try_on_session_id} with success status/URL: ${updateSuccessError.message}`
						);
					}

					return new Response(
						JSON.stringify({
							success: true,
							message: 'Processing completed successfully.'
						}),
						{
							status: 200,
							headers: { 'Content-Type': 'application/json' }
						}
					);
				} else if (currentStatus === 'failed') {
					const errorMsg = result.data || 'Task failed without error details.';

					const { error } = await supabaseClient
						.from('try_on_sessions')
						.update({
							status: 'error',
							error: errorMsg,
							task_id: task_uuid
						})
						.eq('id', try_on_session_id);

					if (error) {
						// Log error but still return success to client as VTO finished
						console.error(
							`Edge Function WARNING: Failed to update session ${try_on_session_id} with success status/URL: ${error.message}`
						);
					}

					console.error('Task failed with error:', errorMsg);
					return createErrorResponse(`Task failed: ${errorMsg}`, 400);
				}

				// Fallback for any unforeseen errors
				return createErrorResponse(`Unknown task status: ${currentStatus}`, 500);
			}
		} catch (apiError) {
			throw new Error(`External API Error: ${apiError}`);
		}
	} catch (error) {
		// --- CENTRALIZED ERROR HANDLING ---
		console.error('Edge Function: An error occurred during processing:', error);

		if (supabaseClient && try_on_session_id) {
			console.warn(
				`Edge Function: Attempting to update session ${try_on_session_id} status to 'error'.`
			);
			const { error: updateDbError } = await supabaseClient
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
		} else {
			console.error(`Cannot update error status in DB.`);
		}
		return createErrorResponse(`Processing Error: ${error}`, 500);
	}
});

async function createTask(
	fullBodyImageName: string,
	clothingImageName: string,
	category: string
): Promise<{
	success: boolean;
	task_uuid?: string;
	user_img_url?: string;
	cloth_img_url?: string;
	error?: string;
}> {
	// Determine the category number
	let categoryNum = 0; // Initialize to 0 (invalid/unassigned)

	if (tops.includes(category)) {
		categoryNum = 1;
	} else if (bottoms.includes(category)) {
		categoryNum = 2;
	}

	if (categoryNum === 0) {
		return { success: false, error: 'Invalid category provided.' };
	}

	const payload = {
		user_img_name: fullBodyImageName,
		cloth_img_name: clothingImageName,
		category: categoryNum.toString(),
		watermark: 2
	};

	try {
		const response = await fetch('https://heybeauty.ai/api/create-task', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${BEAUTY_API}`
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			return {
				success: false,
				error: 'Response Failure: Create Try On Request Failed.'
			};
		}

		const data = await response.json();
		if (data.code !== 0) {
			return { success: false, error: 'API Error: ' + data.message };
		}

		const { uuid, user_img_url, cloth_img_url } = data.data;
		console.log('User Image URL:', user_img_url);
		console.log('Cloth Image URL:', cloth_img_url);

		return { success: true, task_uuid: uuid, user_img_url, cloth_img_url };
	} catch (error) {
		console.error('Error creating task:', error);
		return { success: false, error: 'Exception occurred while creating task.' };
	}
}

async function uploadFullBodyImage(
	user_img_url: string,
	fullBodyData: ArrayBuffer
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(user_img_url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'image/jpeg'
			},
			body: fullBodyData
		});

		if (!response.ok) {
			return {
				success: false,
				error: 'Response Failure: Upload Full Body Image Failed.'
			};
		}

		return { success: true };
	} catch (error) {
		console.error('Error uploading full body image:', error);
		return {
			success: false,
			error: 'Exception occurred while uploading full body image.'
		};
	}
}

// Upload Clothing Image: Accepts the URL and file Buffer.
async function uploadClothingImage(
	cloth_img_url: string,
	clothingData: ArrayBuffer
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(cloth_img_url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/octet-stream'
			},
			body: clothingData
		});

		if (!response.ok) {
			return {
				success: false,
				error: 'Response Failure: Upload Clothing Image Failed.'
			};
		}

		return { success: true };
	} catch (error) {
		console.error('Error uploading clothing image:', error);
		return {
			success: false,
			error: 'Exception occurred while uploading clothing image.'
		};
	}
}

async function submitTask(
	task_uuid: string
): Promise<{ success: boolean; message?: string; error?: string }> {
	const payload = { task_uuid };
	try {
		const response = await fetch('https://heybeauty.ai/api/submit-task', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${BEAUTY_API}`
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			return { success: false, error: 'Response Failure: Submit Task Failed.' };
		}

		const data = await response.json();
		if (data.code !== 0) {
			return { success: false, error: 'API Error: ' + data.message };
		}

		return { success: true, message: task_uuid };
	} catch (error) {
		console.error('Error submitting task:', error);
		return {
			success: false,
			error: 'Exception occurred while submitting task.'
		};
	}
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const tryOnResult = async (
	task_uuid: string
): Promise<{ success: boolean; status?: string; data?: string; error?: string }> => {
	try {
		const payload = { task_uuid };
		const response = await fetch(`https://heybeauty.ai/api/get-task-info`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${BEAUTY_API}`
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			console.error('Fetch error with status', response.status);
			return {
				success: false,
				error: `Failed to fetch task info, status code: ${response.status}`
			};
		}

		const data = await response.json();
		if (data.code !== 0) {
			console.error('API responded with error:', data.message);
			return {
				success: false,
				error: `API Error: ${data.message}`
			};
		}

		console.log('Try On Result:', data);
		const status = data.data.status;

		return {
			success: true,
			status,
			data: data.data.tryon_img_url || data.data.err_msg
		};
	} catch (error) {
		console.error('Error during tryOnResult fetch:', error);
		return {
			success: false,
			error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
};

async function getImageData(imageOrigin: string, filename: string): Promise<File> {
	const res = await fetch(imageOrigin);
	const blob = await res.blob();
	return new File([blob], filename, { type: blob.type });
}

export async function uploadToStorage(
	bucket: string,
	file: File,
	supabase: SupabaseClient,
	prefix?: string
) {
	const fileName = file.name;
	const fileExt = file.name.split('.').pop();
	const uniqueId = crypto.randomUUID();
	const filePath = `${prefix}/${uniqueId}.${fileExt}`;

	const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);

	if (error) {
		console.error(`Error uploading file "${fileName}" to bucket "${bucket}": ${error.message}`);
		throw new Error(`Error uploading file. Please try again later.`);
	}

	return data.path; // Returns the file path in the storage
}
