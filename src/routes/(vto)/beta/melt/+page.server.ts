import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { detectLabels } from '$lib/server/aws/rekognition';
import { predictDescriptor } from '$lib/server/huggingface/inference';
import { describeImage } from '$lib/server/openai/openai';
import { createClient } from '@supabase/supabase-js';
import { uploadToStorage } from '$lib/server/database_helpers/storage';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	detect: async ({ request }) => {
		try {
			// Extract form data
			const formData = await request.formData();
			const image = formData.get('image') as File;

			// Validate input
			if (!image) {
				return { success: false, error: 'No image file provided.' };
			}

			// Ensure the file is a valid image type
			if (!image.type.startsWith('image/')) {
				return {
					success: false,
					error: 'Invalid file type. Please upload an image.'
				};
			}

			const maxSizeMB = 4;
			if (image.size > maxSizeMB * 1024 * 1024) {
				return {
					success: false,
					error: `File size exceeds ${maxSizeMB}MB. Please upload a smaller image.`
				};
			}

			const res = await detectLabels(image);
			console.log(res);

			// Ensure AWS response contains Labels
			if (!res || !res.Labels) {
				return {
					success: false,
					error: 'Failed to process the image. Please try again later.'
				};
			}

			return {
				success: true,
				labels: res.Labels,
				properties: res.ImageProperties
			};
		} catch (error) {
			console.error('Error in detect function:', error);

			return {
				success: false,
				error: error instanceof Error ? error.message : 'An unexpected error occurred.'
			};
		}
	},
	predict: async ({ request }) => {
		const formData = await request.formData();
		const image = formData.get('image') as File;

		const result = await predictDescriptor(image);
		console.log('From server: ', result);
		return { success: true, result };
	},
	chatgpt: async ({ request }) => {
		const formData = await request.formData();
		const image = formData.get('image') as File;
		const imageNodeBuffer = Buffer.from(await image.arrayBuffer());
		const base64Image = imageNodeBuffer.toString('base64');

		const result = await describeImage(base64Image);
		return { success: true, result };
	},
	select: async ({ request }) => {
		const formData = await request.formData();
		const color = formData.get('color') as string;
		console.log('From server: ', color);
		return { success: true, color };
	},
	hi: async () => {
		const invokeOptions = {
			body: { name: 'Functions' }
			// You might need to explicitly set the header if auto-detection fails, though usually not needed for `body`
			// headers: { 'Content-Type': 'application/json' }
		};

		const supabase = createClient(
			'http://127.0.0.1:54321',
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
		);

		const { data, error } = await supabase.functions.invoke('try-on', invokeOptions);

		console.log('--- Function Invocation Result ---');
		console.log('Data:', data);
		console.log('Error:', error); // <-- MOST IMPORTANT LOG!
		console.log('---------------------------------');

		if (error) {
			console.error('Function invocation failed:', error.message);
			// You might find more details in error.context depending on the error type
			// console.error("Error Context:", error.context);
			return { success: false, error: error.message };
		}
		return { success: true, data };
	},
	anonupload: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const clothingFile = formData.get('clothingFile') as File;
		const modelFile = formData.get('modelFile') as File;
		const model_path = formData.get('model_path') as string;

		if (!model_path && !modelFile) {
			return { success: false, message: 'All form fields are required.' };
		}

		const MAX_SIZE = 3 * 1024 * 1024;

		let modelPath;

		if (modelFile && checkFileSize([modelFile], MAX_SIZE)) {
			modelPath = await uploadToStorage('anonymous-vto', modelFile, supabase, 'test');
		} else if (model_path) {
			modelPath = model_path;
		}

		if (checkFileSize([clothingFile], MAX_SIZE)) {
			const clothingPath = await uploadToStorage('anonymous-vto', clothingFile, supabase, 'test');
			console.log('clothingPath: ', clothingPath);
			console.log('modelPath: ', modelPath);

			const invokeOptions = {
				body: { clothingPath: clothingPath, modelPath: modelPath }
			};

			const supabaseForEdge = createClient(
				'http://127.0.0.1:54321',
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
			);

			const { data, error } = await supabaseForEdge.functions.invoke('try-on', invokeOptions);

			console.log('--- Function Invocation Result ---');

			if (error) {
				// Log the high-level error type
				console.error('Function Invocation Error:', error.message);

				// Check if the detailed context (the Response object) is available
				if (error.context && typeof error.context.json === 'function') {
					const response = error.context as Response; // Type assertion for clarity
					console.error(`Response Status: ${response.status} (${response.statusText})`);

					try {
						// Attempt to read the response body as JSON
						// This is crucial for getting the message returned by your function or the gateway
						const errorBody = await response.json();
						console.error('Response Body (JSON):', errorBody);

						// If the function returned a standard { message: "..." } structure, highlight it
						if (errorBody && errorBody.message) {
							console.error('--> Specific Error Message:', errorBody.message);
						} else if (errorBody && errorBody.msg) {
							// Handle common alternatives like { msg: "..." }
							console.error('--> Specific Error Message:', errorBody.msg);
						}
					} catch (jsonError: any) {
						console.warn('Could not parse response body as JSON:', jsonError.message);
						// Fallback: Try reading as plain text if JSON parsing fails
						try {
							// Rewind or clone the response if necessary (depends on runtime, often not needed for error responses)
							// const textResponse = response.clone(); // Use clone if body might be consumed
							const errorText = await response.text();
							console.error('Response Body (Text):', errorText);
						} catch (textError: any) {
							console.error('Could not read response body as text:', textError.message);
						}
					}
				} else if (error.context) {
					// Log context if it exists but isn't a Response-like object
					console.error('Error Context (raw):', error.context);
				}

				// You might still want to log the full error object for stack trace etc.
				// console.error("Full Error Object:", error);
			} else {
				// Success case
				console.log('Data:', data);
			}

			console.log('---------------------------------');

			if (error) {
				console.error('Function invocation failed:', error.message);
				// You might find more details in error.context depending on the error type
				// console.error("Error Context:", error.context);
				return { success: false, error: error.message };
			}

			return {
				success: true,
				message: `Files uploaded successfully.`
			};
		}
		return {
			success: false,
			message: 'File size exceeds the limit of 3MB. Please upload a smaller image.'
		};
	},
	multiselect: async ({ request }) => {
		const formData = await request.formData();
		const materials = formData.get('Test') as string;
		const materialsArray = materials.split(', ');
		console.log('From server: ', materialsArray);
		return { success: true, materials };
	}
};

function checkFileSize(files: File[], maxSize: number): boolean {
	return files.every((file) => file.size < maxSize);
}
