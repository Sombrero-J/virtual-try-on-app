import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { uploadToStorage } from '$lib/server/database_helpers/storage';
import { BEAUTY_API } from '$env/static/private';
import { describeImage } from '$lib/server/openai/openai';
import { json } from '@sveltejs/kit';
import { insertTryOnCache } from '$lib/server/database_helpers/queryDb';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	tryon: async ({ request }) => {
		const formData = await request.formData();
		const fullBodyImageFile = formData.get('fullBodyImageFile') as File | null;
		const clothingImageFile = formData.get('clothingImageFile') as File | null;
		const category = formData.get('category') as string | null;

		if (!fullBodyImageFile || !clothingImageFile || !category) {
			return { success: false, message: 'All form fields are required.' };
		}

		const fullBodyImageName = fullBodyImageFile.name;
		const clothingImageName = clothingImageFile.name;

		let fullBodyData: Buffer;
		let clothingData: Buffer;
		try {
			fullBodyData = Buffer.from(await fullBodyImageFile.arrayBuffer());
			clothingData = Buffer.from(await clothingImageFile.arrayBuffer());
		} catch (err) {
			console.error('Error converting files to Buffer:', err);
			return { success: false, message: 'Error processing image files.' };
		}

		const data = await createTask(fullBodyImageName, clothingImageName, category);
		console.log(data);

		// Create the task
		const { success, task_uuid, user_img_url, cloth_img_url, error } = await createTask(
			fullBodyImageName,
			clothingImageName,
			category
		);
		console.log('Task creation result:', success);
		if (!success) return fail(400, { message: error });

		if (user_img_url) {
			// Upload the full body image
			const fullBodyUploadResult = await uploadFullBodyImage(user_img_url, fullBodyData);
			console.log('Full body upload result:', fullBodyUploadResult);
			if (!fullBodyUploadResult.success)
				return fail(400, { message: 'Failed at uploading body image' });
		}

		if (cloth_img_url) {
			// Upload the clothing image
			console.log('Uploading clothing image');
			const clothingUploadResult = await uploadClothingImage(cloth_img_url, clothingData);
			console.log('Clothing upload result:', clothingUploadResult);
			if (!clothingUploadResult.success)
				return fail(400, { message: 'Failed at uploading clothing image' });
		}

		if (task_uuid) {
			const { success, error } = await submitTask(task_uuid);
			if (!success) return fail(400, { message: error });
		}
		return json(task_uuid);
	},
	save: async ({ request, locals: { safeGetSession, supabase } }) => {
		// if user is not signed in, redirect them to login page, after that save the image to their profile
		const { session, user } = await safeGetSession();

		const formData = await request.formData();

		const taskID = formData.get('taskID') as string;

		const clothingFile = formData.get('clothingFile') as File;
		const clothingName = clothingFile.name;
		const modelFile = formData.get('modelFile') as File;
		const model_path = formData.get('model_path') as string;

		if (!model_path && !modelFile) {
			return { success: false, message: 'All form fields are required.' };
		}

		const tryon = formData.get('tryonUrl') as string;
		const tryonFile = await getImageData(tryon, `tryon_${user?.id || 'anonymous'}`);

		const clothingNodeBuffer = Buffer.from(await clothingFile.arrayBuffer());
		const clothingBase64 = clothingNodeBuffer.toString('base64');

		const { result, error } = await describeImage(clothingBase64);
		if (error) {
			return fail(400, { message: error });
		}
		if (!result) {
			return fail(400, { message: 'Error while describing the image' });
		}
		const { description, brand, color, material, category } = JSON.parse(result);

		const brand_value = brand === 'null' ? null : brand;
		const material_value = material === 'null' ? null : material;

		const MAX_SIZE = 3 * 1024 * 1024;

		let modelPath;

		if (modelFile && checkFileSize([modelFile], MAX_SIZE)) {
			modelPath = await uploadToStorage('models', modelFile, supabase, user?.id || 'anonymous');
		} else if (model_path) {
			modelPath = model_path;
		}

		if (checkFileSize([clothingFile, tryonFile], MAX_SIZE)) {
			const clothingPath = await uploadToStorage(
				'clothings',
				clothingFile,
				supabase,
				user?.id || 'anonymous'
			);
			const tryonPath = await uploadToStorage(
				'tryon',
				tryonFile,
				supabase,
				user?.id || 'anonymous'
			);

			if (!modelPath) {
				return fail(400, { message: 'Model path does not exist' });
			}

			if (!session || !user) {
				const sessionID = crypto.randomUUID();
				const { success, error } = await insertTryOnCache(supabase, {
					session_token: sessionID,
					clothing_name: clothingName,
					clothing_path: clothingPath,
					model_path: modelPath,
					try_on_path: tryonPath,
					task_id: taskID,
					clothing_description: description,
					brand: brand_value,
					colors: color,
					materials: material_value,
					category: category
				});

				console.log('Cache insert result:', success);

				if (success) {
					const redirectTo = `/home?autoSave=${sessionID}`; // redirect to home page
					redirect(307, `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
				} else if (error) {
					console.error('Error saving to cache:', error);
					fail(400, { message: 'Error saving to cache. Please sign in and retry.' });
				}
			}

			if (!user) {
				return fail(400, { message: 'User not found' });
			}
			const { data, error } = await supabase.rpc('save_tryon', {
				// check if this function checks if modelPath exists
				p_user_id: user.id,
				p_clothing_name: clothingName,
				p_task_id: taskID,
				p_clothing_image_url: clothingPath,
				p_model_image_url: modelPath,
				p_try_on_image_url: tryonPath,
				p_description: description,
				p_brands: brand_value,
				p_colors: color,
				p_materials: material_value,
				p_category: category
			});

			if (error) {
				const buckets = [
					{ bucket: 'clothings', path: clothingPath },
					{ bucket: 'models', path: modelPath },
					{ bucket: 'tryon', path: tryonPath }
				];

				for (const { bucket, path } of buckets) {
					const { error: delError } = await supabase.storage.from(bucket).remove([path]);
					if (delError) {
						console.error(`Failed to delete orphaned file from ${bucket}: ${delError.message}`);
					}
				}
				console.log(
					'Error saving: ' + JSON.stringify(error, null, 2) + 'Rollback storage success.'
				);
				return fail(400, { message: 'Save error. ' + error });
			}

			// what is data? return clothing ID in database so we can goto wardrobe/clothingID
			return { success: true, data: data };
		} else {
			return { success: false, message: 'File(s) exceeded maximum size.' };
		}
	}
};

function checkFileSize(files: File[], maxSize: number): boolean {
	return files.every((file) => file.size < maxSize);
}

async function getImageData(imageOrigin: string, filename: string): Promise<File> {
	const res = await fetch(imageOrigin);
	const blob = await res.blob();
	return new File([blob], filename, { type: blob.type });
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
	const categoryItems = ['Upper Body', 'Lower Body', 'Dresses', 'Full Body', 'Hair'];
	const categoryNum = categoryItems.indexOf(category) + 1;

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
	fullBodyData: Buffer
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

async function uploadClothingImage(
	cloth_img_url: string,
	clothingData: Buffer
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
