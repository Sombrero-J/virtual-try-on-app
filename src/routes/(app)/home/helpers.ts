import type { ModelsType } from '$lib/server/database_helpers/queryDb';

export async function continueSaveAction(sessionId: string) {
	const actionUrl = '/api/saveTryOn';
	const payload = {
		sessionId: sessionId
	};
	try {
		const response = await fetch(actionUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		// SvelteKit actions return ActionResult JSON even on errors handled by `fail()`
		// parse the JSON to understand the outcome.
		const responseBody = await response.json();

		if (response.ok) {
			// Status 200-299
			console.log('Save successful:', responseBody);
			return {
				success: true,
				data: responseBody.newClothingId,
				message: 'Saving successful.'
			};
		} else {
			// Handle specific known error statuses from your API
			const errorMessage = responseBody.message || `An error occurred (Status: ${response.status})`;
			console.error(`Failed to save try-on (${response.status}):`, errorMessage);
			return {
				success: false,
				message: errorMessage
			};

			// if (response.status === 401) {
			// 	addToast({ type: 'error', message: 'Authentication error. Please log in again.' });
			// 	// Optional: redirect to login
			// 	// goto('/auth/login');
			// } else if (response.status === 404) {
			// 	addToast({
			// 		type: 'warning',
			// 		message: 'Could not find the try-on data. It might have expired.'
			// 	});
			// } else if (response.status === 409) {
			// 	// Conflict
			// 	addToast({ type: 'warning', message: errorMessage }); // Use message from API ("already saved" or "record might exist")
			// 	// Optional: Navigate to the existing outfit if ID is provided
			// 	// if (responseBody.data?.existingOutfitId) {
			// 	//    goto(`/outfits/${responseBody.data.existingOutfitId}`);
			// 	// }
			// } else if (response.status === 410) {
			// 	// Gone (Expired)
			// 	addToast({ type: 'warning', message: 'The cached try-on data has expired.' });
			// } else if (response.status === 400) {
			// 	// Bad Request (missing sessionID, invalid JSON)
			// 	addToast({ type: 'error', message: `Request error: ${errorMessage}` });
			// } else {
			// 	// 5xx Server errors or other unexpected client errors
			// 	addToast({ type: 'error', message: `Save failed: ${errorMessage}` });
			// }
		}
	} catch (error) {
		// Handle network errors or issues parsing non-JSON responses
		console.error('Fetch failed or could not parse response:', error);
		return {
			success: false,
			message: 'An error occurred while trying to save the try-on.'
		}
	}
}

export async function triggerSaveAction(
	taskID: string,
	clothingFile: File | null,
	tryOnUrl: string,
	selectedModel?: ModelsType[number] | null,
	selectedModelFile?: File | null
) {
	if (!taskID || !clothingFile || !tryOnUrl) {
		return {
			success: false,
			message: 'Missing required information. Please try again or contact support.'
		};
	}

	if (!selectedModel && !selectedModelFile) {
		return {
			success: false,
			message: 'Missing model image. Please try again or contact support.'
		};
	}

	const formData = new FormData();
	formData.append('taskID', taskID);
	formData.append('clothingFile', clothingFile);
	formData.append('tryonUrl', tryOnUrl);

	if (selectedModel) {
		formData.append('model_path', selectedModel.image_url as string);
	} else if (selectedModelFile) {
		formData.append('modelFile', selectedModelFile);
	}

	const actionUrl = '/vto/generation?/save';

	try {
		const response = await fetch(actionUrl, {
			method: 'POST',
			body: formData
		});

		// SvelteKit actions return ActionResult JSON even on errors handled by `fail()`
		// parse the JSON to understand the outcome.
		const result = await response.json();

		if (!response.ok) {
			return {
				success: false,
				message: `Saving failed: ${result?.message || response.statusText || 'Server error'}`
			};
		}

		if (result.type === 'success') {
			return {
				success: true,
				data: result.data,
				message: 'Saving successful.'
			};
		} else if (result.type === 'failure') {
			return {
				success: false,
				message: `Saving action failed: ${result?.message || response.statusText || 'Server error'}`
			};
		} else if (result.type === 'error') {
			return {
				success: false,
				message: `Saving action failed: ${result?.message || response.statusText || 'Server error'}`
			};
		} else {
			return {
				success: false,
				message: 'Unexpected result.'
			};
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error submitting save action:' + error
		};
	}
}
