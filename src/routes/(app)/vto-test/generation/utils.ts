import { addToast } from '$lib/components/melt/toast.svelte';
import { tryOnStore } from '$lib/state/vto.svelte';
const tryOn = tryOnStore();

export async function fetchSubmitTask(): Promise<{
	data: string | null;
	error: string | null;
}> {
	try {
		const formData = new FormData();
		const modelImage = tryOn.modelImageFile;
		const clothingImage = tryOn.clothingImageFile;
		const cat = tryOn.category;

		if (!modelImage || !clothingImage || !cat) {
			return { data: null, error: 'Missing form fields.' };
		}

		formData.append('fullBodyImageFile', modelImage);
		formData.append('clothingImageFile', clothingImage);
		formData.append('category', cat);

		const res = await fetch('/api/submitTask', {
			method: 'POST',
			body: formData
		});

		if (!res.ok) {
			let errorMessage = 'Failed to submit task.';
			try {
				const errorData = await res.json();
				errorMessage = errorData.message || errorMessage;
			} catch {
				throw new Error('Response unreadable.');
			}
			return { data: null, error: 'Response error: ' + errorMessage };
		}

		const data = await res.json();
		return { data: data.task_uuid, error: null };
	} catch (error) {
		console.error(error);
		return { data: null, error: 'Something went wrong.' };
	}
}

export async function fetchQueryTask(taskID: string): Promise<{ url?: string; error?: string }> {
	try {
		const response = await fetch('/api/queryTask', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ taskID })
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Unknown error occurred while querying task.');
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error querying task:', error);
		throw error;
	}
}

export async function downloadFileFromBlob(url: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Failed to fetch file');
		}

		let blob;
		try {
			blob = await response.blob();
		} catch (blobError) {
			console.error('Blob conversion error:', blobError);
			throw new Error('Failed to process file data after download.');
		}

		const blobUrl = window.URL.createObjectURL(blob);
		downloadFile(blobUrl, 'tryon');

		// Clean up the blob URL after a short delay
		setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
		addToast({
			data: {
				type: 'success',
				title: 'Download Started',
				description: `Your image is downloading. Check your browser's download manager.`
			}
		});
	} catch (error) {
		console.error('Download process failed:', error);

		let errorMessage = 'An unexpected error occurred while trying to download the file.';
		if (error instanceof Error) {
			errorMessage = error.message;
		}

		addToast({
			data: {
				type: 'error',
				title: 'Download Failed',
				description: errorMessage + ' Please try again.'
			}
		});
	}
}

function downloadFile(url: string, filename: string = 'tryon') {
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
