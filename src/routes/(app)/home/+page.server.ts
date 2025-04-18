import { getModels } from '$lib/server/database_helpers/queryDb';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	createTask,
	submitTask,
	uploadClothingImage,
	uploadFullBodyImage
} from '$lib/server/vto/tryonfunctions';
import { uploadToStorage } from '$lib/server/database_helpers/storage';
import { describeImage } from '$lib/server/openai/openai';

interface DescribeImageResult {
	description: string;
	brand: string | null;
	color: string[];
	material: string | null;
	category: string;
}

interface FulfilledImageResult {
	status: 'fulfilled'; // Discriminant property with a literal type
	value: {
		clothingData: {
			name: string;
			image_path: string;
			user_id: string;
			description: string;
			colors: string[];
			brand: string | null;
			material: string | null;
			category: string;
		};
		storagePath: string;
	};
}

interface RejectedImageResult {
	status: 'rejected';
	reason: {
		name: string;
		reason: 'size' | 'description_generation' | 'upload_error' | 'parsing_error' | 'unknown';
		error?: unknown;
	};
}

type ProcessedImageResult = FulfilledImageResult | RejectedImageResult;

export const load: PageServerLoad = async ({ parent, locals: { supabase, user } }) => {
	const title = 'All items'; //this is for the layout title

	if (!user) {
		redirect(302, '/auth/login');
	}
	const user_id = user.id;

	// streaming promises from layout.server.ts
	const parentData = parent();
	const modelData = getModels(supabase, user_id);
	return { parentData, modelData, title: title, message: null };
};

export const actions: Actions = {
	tryon: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const model_path = formData.get('model_path') as string;
		const model_image = formData.get('model_file') as File;

		if (!model_path && !model_image) {
			return { success: false, message: 'All form fields are required.' };
		}

		const category = formData.get('category') as string;
		const clothing_image = formData.get('clothing_image') as File;

		if (!category || !clothing_image) {
			return { success: false, message: 'All form fields are required.' };
		}

		const fullBodyImageName = model_path
			? model_path.split('/').pop() || 'model image'
			: model_image.name;
		const clothingImageName = clothing_image.name;

		let modelImageFile;

		if (model_path) {
			const { data, error: downloadError } = await supabase.storage
				.from('models')
				.download(model_path);

			if (downloadError) {
				return { success: false, message: 'Error downloading model file.' };
			}
			modelImageFile = data;
		} else {
			modelImageFile = model_image;
		}

		let fullBodyData: Buffer;
		let clothingData: Buffer;
		try {
			fullBodyData = Buffer.from(await modelImageFile.arrayBuffer());
			clothingData = Buffer.from(await clothing_image.arrayBuffer());
		} catch (err) {
			console.error('Error converting files to Buffer:', err);
			return { success: false, message: 'Error processing image files.' };
		}

		const { success, task_uuid, user_img_url, cloth_img_url, error } = await createTask(
			fullBodyImageName,
			clothingImageName,
			category
		);
		console.log('Task creation result:', success);
		if (!success) return fail(400, { message: error });

		if (user_img_url) {
			const fullBodyUploadResult = await uploadFullBodyImage(user_img_url, fullBodyData);
			console.log('Full body upload result:', fullBodyUploadResult);
			if (!fullBodyUploadResult.success)
				return fail(400, { message: 'Failed at uploading body image' });
		}

		if (cloth_img_url) {
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
		return { success: true, taskID: task_uuid };
	},
	addNewModel: async ({ request, locals: { supabase, user } }) => {
		if (!user) {
			redirect(302, '/auth/login');
		}
		const user_id = user.id;

		const formData = await request.formData();
		const entries = formData.getAll('model_image');
		const model_images = entries.filter(
			(entry): entry is File => entry instanceof File && entry.size > 0
		);

		if (model_images.length === 0) {
			return fail(400, {
				success: false,
				message: 'No model image files were uploaded or files are empty.',
				missing: true
			});
		}
		const MAX_SIZE = 3 * 1024 * 1024;

		const uploadPromises = model_images.map(async (modelFile) => {
			if (!checkFileSize(modelFile, MAX_SIZE)) {
				return { status: 'rejected', reason: 'size', name: modelFile.name };
			}
			try {
				// upload model images to storage
				const fullModelPath = await uploadToStorage('models', modelFile, supabase, user.id);
				return { status: 'uploaded', path: fullModelPath, name: modelFile.name };
			} catch (error) {
				console.error(`Failed to upload ${modelFile.name}:`, error);
				return {
					status: 'rejected',
					reason: 'upload_error',
					name: modelFile.name,
					error: error
				};
			}
		});

		const uploadResults = await Promise.all(uploadPromises);

		const uploadedPaths = uploadResults.filter((r) => r.status === 'uploaded').map((r) => r.path!);
		const rejectedImages = uploadResults
			.filter((r) => r.status === 'rejected')
			.map((r) => ({ name: r.name, reason: r.reason, error: r.error }));

		if (rejectedImages.length > 0 && uploadedPaths.length === 0) {
			return fail(500, {
				success: false,
				message: 'Failed to upload any files.',
				rejectedImages: rejectedImages
			});
		}
		if (rejectedImages.length > 0) {
			console.warn('Some files failed to upload:', rejectedImages);
		}

		try {
			if (uploadedPaths.length > 0) {
				// insert models to database

				// const insertedData = await insertModel(supabase, user_id, uploadedPaths);

				const { data: insertedCount, error } = await supabase.rpc('add_new_models', {
					p_image_urls: uploadedPaths,
					p_user_id: user_id
				});

				if (error) {
					const { error: delError } = await supabase.storage.from('models').remove(uploadedPaths);

					if (delError) {
						console.error(`Failed to delete orphaned file from models: ${delError.message}`);
						return fail(500, {
							success: false,
							message: 'Failed to upload any files, and rollback unsuccessful.',
							uploadedPaths: uploadedPaths,
							rejectedImages: rejectedImages,
							errors: delError
						});
					}

					return fail(500, {
						success: false,
						message: `Add new models failure, rollback success: ${error.message}`,
						uploadedPaths: uploadedPaths,
						rejectedImages: rejectedImages
					});
				}

				return {
					success: true,
					message: `${insertedCount} model(s) added successfully.`,
					insertedCount: insertedCount,
					rejectedImages: rejectedImages
				};
			}
		} catch (dbError) {
			console.error('Database insertion failed after uploads:', dbError);
			const { error: delError } = await supabase.storage.from('models').remove(uploadedPaths);
			if (delError) {
				console.error(`Failed to delete orphaned file from models: ${delError.message}`);
				return fail(500, {
					success: false,
					message: 'Failed to upload any files, and rollback unsuccessful.',
					uploadedPaths: uploadedPaths,
					rejectedImages: rejectedImages,
					errors: delError
				});
			}
			return fail(500, {
				success: false,
				message: `Database failure, rollback success: ${dbError}`,
				uploadedPaths: uploadedPaths,
				rejectedImages: rejectedImages
			});
		}
	},
	addNewClothings: async ({ request, locals: { supabase, user } }) => {
		if (!user) {
			redirect(302, '/auth/login');
		}
		const user_id = user.id;

		const formData = await request.formData();
		const entries = formData.getAll('clothing_images');
		const clothing_images = entries.filter(
			(entry): entry is File => entry instanceof File && entry.size > 0
		);

		if (clothing_images.length === 0) {
			return fail(400, {
				success: false,
				message: 'No clothing image files were uploaded or files are empty.',
				missing: true
			});
		}

		const MAX_SIZE = 3 * 1024 * 1024;

		const processingPromises: Promise<ProcessedImageResult>[] = clothing_images.map(
			async (clothingFile): Promise<ProcessedImageResult> => {
				const fileName = clothingFile.name;
				try {
					if (!checkFileSize(clothingFile, MAX_SIZE)) {
						return {
							status: 'rejected',
							reason: { name: fileName, reason: 'size', error: 'Size of image larger than 3MB' }
						};
					}

					const clothingNodeBuffer = Buffer.from(await clothingFile.arrayBuffer());
					const clothingBase64 = clothingNodeBuffer.toString('base64');

					// get description
					const { result: descriptionJson, error: descriptionError } =
						await describeImage(clothingBase64);

					if (descriptionError || !descriptionJson) {
						console.error(`Description generation failed for ${fileName}:`, descriptionError);
						return {
							status: 'rejected',
							reason: {
								reason: 'description_generation',
								name: fileName,
								error: descriptionError
							}
						};
					}

					let parsedData: DescribeImageResult;
					try {
						parsedData = JSON.parse(descriptionJson);
					} catch (parseError) {
						console.error(`Failed to parse ${descriptionJson}`, parseError);
						return {
							status: 'rejected',
							reason: {
								reason: 'parsing_error',
								name: fileName,
								error: parseError
							}
						};
					}

					const { description, brand, color, material, category } = parsedData;

					const brand_value = brand === 'null' ? null : brand;
					const material_value = material === 'null' ? null : material;

					if (!description || !category || !Array.isArray(color)) {
						console.error(`Invalid parsed data structure for ${fileName}:`, parsedData);
						throw new Error('parsing_error');
					}

					const fullClothingPath = await uploadToStorage(
						'clothings',
						clothingFile,
						supabase,
						user.id
					);
					return {
						status: 'fulfilled',
						value: {
							clothingData: {
								name: fileName,
								user_id: user_id,
								image_path: fullClothingPath,
								description: description,
								brand: brand_value,
								colors: color,
								material: material_value,
								category: category
							},
							storagePath: fullClothingPath
						}
					};
				} catch (error) {
					return {
						status: 'rejected',
						reason: { reason: 'unknown', name: fileName, error: error }
					};
				}
			}
		);

		// process all promises
		const results = await Promise.allSettled(processingPromises);

		const successfullyProcessed: FulfilledImageResult['value'][] = [];
		const rejectedImages: RejectedImageResult['reason'][] = [];

		// filter results
		results.forEach((result) => {
			if (
				result.status === 'fulfilled' &&
				result.value?.status === 'fulfilled' &&
				result.value.value
			) {
				successfullyProcessed.push(result.value.value);
			} else if (result.status === 'rejected') {
				rejectedImages.push({
					name: result.reason.name,
					reason: result.reason.reason,
					error: result.reason.error
				});
			}
		});

		let insertedCount = 0; // for reporting in frontend
		const dbFailedItems: { storagePath: string; name: string; error: unknown }[] = [];

		// database insertion
		if (successfullyProcessed.length > 0) {
			console.log(
				`Attempting to insert ${successfullyProcessed.length} items into the database via RPC...`
			);

			for (const item of successfullyProcessed) {
				const { clothingData, storagePath } = item;

				try {
					const { error: rpcError } = await supabase.rpc('add_new_clothings', {
						p_clothing_name: clothingData.name,
						p_clothing_image_url: clothingData.image_path,
						p_user_id: clothingData.user_id,
						p_description: clothingData.description,
						p_colors: clothingData.colors, // array
						p_brands: clothingData.brand, // can be null
						p_materials: clothingData.material, // can be null
						p_category: clothingData.category
					});

					if (rpcError) {
						console.error(`RPC 'add_new_clothings' failed for ${clothingData.name}:`, rpcError);
						dbFailedItems.push({ storagePath, name: clothingData.name, error: rpcError });
					} else {
						insertedCount++;
						// call edge vto here with clothingData.image_path with model_images
					}
				} catch (rpcCatchError) {
					console.error(`Unexpected error calling RPC for ${clothingData.name}:`, rpcCatchError);
					dbFailedItems.push({ storagePath, name: clothingData.name, error: rpcCatchError });
				}
			}
		} else {
			console.log('No items were successfully processed to attempt database insertion.');
		}

		// rollback storage for failed DB inserts
		if (dbFailedItems.length > 0) {
			const failedStoragePaths = dbFailedItems.map((item) => item.storagePath);

			try {
				const { error: deleteError } = await supabase.storage
					.from('clothings')
					.remove(failedStoragePaths);

				if (deleteError) {
					console.error('Storage rollback failed for DB errors:', deleteError);

					const allRejections = [
						...rejectedImages,
						...dbFailedItems.map((f) => ({
							name: f.name,
							reason: 'database_insert_error',
							error: f.error
						}))
					];
					return fail(500, {
						success: false,
						message: `Inserted ${insertedCount} items. ${dbFailedItems.length} items failed database insertion AND storage rollback.`,
						insertedCount: insertedCount,
						rejectedImages: allRejections,
						rollbackFailedPaths: failedStoragePaths // paths that failed rollback
					});
				} else {
					console.log('Storage rollback for DB errors successful.');
				}
			} catch (rollbackCatchError) {
				console.error(
					'Unexpected error during storage rollback for DB failures:',
					rollbackCatchError
				);
				const allRejections = [
					...rejectedImages,
					...dbFailedItems.map((f) => ({
						name: f.name,
						reason: 'database_insert_error',
						error: f.error
					}))
				];
				return fail(500, {
					success: false,
					message: `Inserted ${insertedCount} items. ${dbFailedItems.length} items failed database insertion. An unexpected error occurred during storage rollback.`,
					error: rollbackCatchError,
					insertedCount: insertedCount,
					rejectedImages: allRejections
				});
			}
		}

		// all failed items here
		const allFailedItems = [
			...rejectedImages,
			...dbFailedItems.map((f) => ({
				name: f.name,
				reason: 'database_insert_error',
				error: f.error
			}))
		];

		// if all items failed
		if (insertedCount === 0 && allFailedItems.length > 0) {
			return fail(400, {
				success: false,
				message: 'No clothing items were added successfully.',
				insertedCount: 0,
				rejectedImages: allFailedItems
			});
		}

		// at least a few successful inserts
		return {
			success: true,
			message: `${insertedCount} clothing item(s) added successfully. ${allFailedItems.length > 0 ? ` ${allFailedItems.length} item(s) failed.` : ''}`,
			insertedCount: insertedCount,
			rejectedImages: allFailedItems
		};
	}
};

function checkFileSize(file: File, maxSize: number): boolean {
	return file.size < maxSize;
}
