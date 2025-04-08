import type { ModelsType } from '$lib/server/database_helpers/queryDb';

export async function triggerSaveAction(
	isSaving: boolean,
	taskID: string,
	clothingFile: File | null,
	tryOnUrl: string,
	selectedModel?: ModelsType[number] | null,
	selectedModelFile?: File | null
) {
	if (isSaving) return;

	if (!taskID || !clothingFile || !tryOnUrl) {
		alert('Missing required information to save. Please try again.');
		return;
	}

	if (!selectedModel && !selectedModelFile) {
		console.log('Please select a model image');
		return;
	}

	isSaving = true;

	const formData = new FormData();
	formData.append('taskID', taskID);
	formData.append('clothingFile', clothingFile);
	formData.append('tryonUrl', tryOnUrl);

	if (selectedModel) {
		formData.append('model_path', selectedModel.image_url as string);
	} else if (selectedModelFile) {
		formData.append('modelFile', selectedModelFile);
	}

	const actionUrl = '/beta/vto-test/generation?/save';

	try {
		const response = await fetch(actionUrl, {
			method: 'POST',
			body: formData
		});

		// SvelteKit actions return ActionResult JSON even on errors handled by `fail()`
		// You need to parse the JSON to understand the outcome.
		const result = await response.json();

		if (!response.ok) {
			// Handle HTTP errors (e.g., 500 Internal Server Error)
			// or errors thrown before `fail()` is called in the action.
			// `result` might contain error details if the server sent them as JSON.
			console.error('Save action failed (HTTP Error):', response.status, result);
			alert(`Saving failed: ${result?.message || response.statusText || 'Server error'}`);
			isSaving = false;
			return;
		}

		if (result.type === 'success') {
			console.log('Save successful. Data:', result.data); // Action might return data
			isSaving = false;
		} else if (result.type === 'failure') {
			// Failure typically means validation errors returned via `fail()`
			console.error('Save action failed (Validation):', result.data);
			// Adjust based on how your action returns failure data in `result.data`
			const message =
				result.data?.message ||
				JSON.stringify(result.data) ||
				'Saving failed, please check inputs.';
			alert('Saving failed: ' + message);
			isSaving = false;
		} else if (result.type === 'error') {
			// Error means an unexpected error occurred on the server
			console.error('Save action failed (Server Error):', result.error);
			alert(`An error occurred: ${result.error?.message || 'Unknown server error'}`);
			isSaving = false;
		} else {
			// Handle unexpected result type? Should not happen with standard actions.
			console.warn('Unexpected result type from action:', result);
			alert('An unexpected response was received from the server.');
			isSaving = false;
		}
	} catch (error) {
		console.error('Error submitting save action:', error);
		alert(
			`An error occurred while trying to save: ${error instanceof Error ? error.message : String(error)}`
		);
		isSaving = false;
	}
	// No finally here if navigating away on success
}
