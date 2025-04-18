import { SupabaseClient } from 'jsr:@supabase/supabase-js@^2';
import { updateSessionStatusOnError, uploadToStorage } from './db.ts';
import { getImageData } from './utils.ts';

const BEAUTY_API = Deno.env.get('BEAUTY_API');
const tops = ['T-Shirts', 'Long-Sleeve Tops', 'Shirts', 'Sweaters', 'Hoodies', 'Sleeveless'];
const bottoms = ['Jeans', 'Pants', 'Skirts', 'Shorts', 'Athletic Bottoms'];
const POLLING_INTERVAL_MS = 8000; // 8 seconds
const MAX_POLLING_ATTEMPTS = 10;

interface VtoInput {
	modelName: string;
	clothingName: string;
	categoryName: string;
	modelData: ArrayBuffer;
	clothingData: ArrayBuffer;
}

interface DbInfo {
	supabaseClient: SupabaseClient;
	try_on_session_id: number | null;
	outfits_id: number | null;
	user_id: string;
}

/**
 * Handles the interaction with the VTO API, including task creation,
 * image uploads, task submission, polling, result handling, and updating
 * the Supabase database accordingly.
 *
 * @param vtoInput - Data related to the VTO process (model/clothing paths, names, data).
 * @param dbInfo - Supabase client instance and relevant session/user IDs.
 * @returns A Promise resolving to a Response object (either success or error).
 */
export async function generateTryOn(
	vtoInput: VtoInput,
	dbInfo: DbInfo
): Promise<{ success: boolean; message?: string; data?: { tryOnPath: string; task_id: string } }> {
	const { modelName, clothingName, categoryName, modelData, clothingData } = vtoInput;
	const { supabaseClient, try_on_session_id, outfits_id, user_id } = dbInfo;
	let task_uuid: string | undefined; // Keep track of task_uuid for DB updates on error

	try {
		console.log('Edge Function: Creating task with VTO API...');

		const taskCreationResult = await createTask(modelName, clothingName, categoryName);
		console.log('Task creation result:', taskCreationResult);

		if (!taskCreationResult.success) {
			await updateSessionStatusOnError(
				supabaseClient,
				try_on_session_id,
				outfits_id,
				`VTO API Error: Task creation failed - ${taskCreationResult.error || 'Unknown error'}`,
				task_uuid // Will be undefined here, which is okay
			);

			return {
				success: false,
				message: `Task creation failed: ${taskCreationResult.error || 'Unknown error'}`
			};
		}

		task_uuid = taskCreationResult.task_uuid;
		const user_img_url = taskCreationResult.user_img_url;
		const cloth_img_url = taskCreationResult.cloth_img_url;

		if (user_img_url) {
			const fullBodyUploadResult = await uploadFullBodyImage(user_img_url, modelData);
			console.log('Full body upload result:', fullBodyUploadResult);
			if (!fullBodyUploadResult.success) {
				await updateSessionStatusOnError(
					supabaseClient,
					try_on_session_id,
					outfits_id,

					`VTO API Error: Failed uploading body image - ${fullBodyUploadResult.error || 'Unknown error'}`,
					task_uuid
				);
				return {
					success: false,
					message: `VTO API Error: Failed uploading body image - ${fullBodyUploadResult.error || 'Unknown error'}`
				};
			}
		} else {
			console.warn('Edge Function: No model upload URL provided by VTO API.');
		}

		if (cloth_img_url) {
			const clothingUploadResult = await uploadClothingImage(cloth_img_url, clothingData);
			console.log('Clothing upload result:', clothingUploadResult);
			if (!clothingUploadResult.success) {
				await updateSessionStatusOnError(
					supabaseClient,
					try_on_session_id,
					outfits_id,

					`VTO API Error: Failed uploading clothing image - ${clothingUploadResult.error || 'Unknown error'}`,
					task_uuid
				);
				return {
					success: false,
					message: `VTO API Error: Failed uploading clothing image - ${clothingUploadResult.error || 'Unknown error'}`
				};
			}
		} else {
			console.warn('Edge Function: No clothing upload URL provided by VTO API.');
		}

		if (task_uuid) {
			const { success, error } = await submitTask(task_uuid);
			if (!success) {
				await updateSessionStatusOnError(
					supabaseClient,
					try_on_session_id,
					outfits_id,

					`Task submission failed: ${error || 'Unknown error'}`,
					task_uuid
				);
				return {
					success: false,
					message: `Task submission failed: ${error || 'Unknown error'}`
				};
			}

			let result = await tryOnResult(task_uuid);
			// we don't handle success is false here, retry.

			let currentStatus = result.status;
			console.log('Initial Status:', currentStatus);

			let attempts = 0;
			// Poll until the task is either "successed" or "failed"
			while (currentStatus !== 'successed' && currentStatus !== 'failed') {
				if (attempts++ >= MAX_POLLING_ATTEMPTS) {
					console.error('Polling timed out after maximum attempts');
					await updateSessionStatusOnError(
						supabaseClient,
						try_on_session_id,
						outfits_id,

						'VTO Process Error: Task polling timed out.',
						task_uuid
					);
					return {
						success: false,
						message: 'Task timed out after maximum polling attempts.'
					};
				}

				await delay(POLLING_INTERVAL_MS);

				result = await tryOnResult(task_uuid);
				if (!result.success) {
					// Don't update DB here, maybe the next poll will succeed. Let timeout handle persistent fetch errors.
				}

				currentStatus = result.status;
				console.log('Polled Status:', currentStatus);
			}

			if (currentStatus === 'successed') {
				const tryonUrl = result.data;
				console.log('Task succeeded with URL:', tryonUrl);

				// store the tryonUrl in the "tryon" storage bucket
				if (!tryonUrl) {
					await updateSessionStatusOnError(
						supabaseClient,
						try_on_session_id,
						outfits_id,
						'VTO API Error: Task succeeded but returned no valid URL.',
						task_uuid
					);
					return {
						success: false,
						message: 'No try-on URL returned from API.'
					};
				}

				const tryonFile = await getImageData(tryonUrl, `tryon_${user_id}`);
				const tryonPath = await uploadToStorage('tryon', tryonFile, supabaseClient, user_id);

				if (!tryonPath) {
					await updateSessionStatusOnError(
						supabaseClient,
						try_on_session_id,
						outfits_id,

						'Internal Server Error: Failed to save final try-on image.',
						task_uuid
					);
					return {
						success: false,
						message: 'Failed to upload try-on image.'
					};
				}
				console.log('Try-on image uploaded to storage:', tryonPath);

				// Update the "status" column of try_on_sessions to "done", and save the try on images

				if (try_on_session_id) {
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
				}

				return {
					success: true,
					data: {
						tryOnPath: tryonPath,
						task_id: task_uuid
					}
				};
			} else if (currentStatus === 'failed') {
				const errorMsg = result.data || 'Task failed without error details.';

				await updateSessionStatusOnError(
					supabaseClient,
					try_on_session_id,
					outfits_id,

					`VTO Task Failed: ${errorMsg}`,
					task_uuid
				);

				console.error('Task failed with error:', errorMsg);
				return {
					success: false,
					message: `VTO Task Failed: ${errorMsg}`
				};
			}

			// Fallback for any unforeseen errors
			await updateSessionStatusOnError(
				supabaseClient,
				try_on_session_id,
				outfits_id,

				`Internal Error: Unknown final task status (${currentStatus})`,
				task_uuid
			);
			return {
				success: false,
				message: `Unknown task status: ${currentStatus}`
			};
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		await updateSessionStatusOnError(
			supabaseClient,
			try_on_session_id,
			outfits_id,

			`Internal VTO Process Error: ${errorMessage}`,
			task_uuid
		);
		return {
			success: false,
			message: `External API Error: ${errorMessage}`
		};
	}
	return {
		success: false,
		message: 'Something went wrong.'
	};
}

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
