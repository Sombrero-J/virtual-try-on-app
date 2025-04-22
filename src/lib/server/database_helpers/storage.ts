import { v4 as uuidv4 } from 'uuid';

export async function uploadToStorage(
	bucket: string,
	file: File,
	supabase: supabaseFull,
	user_id: string
) {
	const fileName = file.name;
	const fileExt = file.name.split('.').pop();
	const uniqueId = uuidv4();

	const filePath = `${user_id}/${uniqueId}${fileExt ? '.' + fileExt : ''}`;

	const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);

	if (error) {
		console.error(
			`Error uploading file "${fileName}" to bucket "${bucket}": ${error.message}.`
		);
		throw new Error(`Error uploading file. Please try again later.`);
	}

	if (!data?.path) {
		console.error(
			`Upload to ${bucket}/${filePath} succeeded but path is missing in response data.`
		);
		throw new Error('Storage upload succeeded but failed to retrieve the file path.');
	}

	return data.path; // Returns the file path in the storage
}

export async function rollbackStorage(
	supabase: supabaseFull,
	files: Array<{ bucket: string; path: string }>
): Promise<boolean> {
	// delete all files concurrently
	const deletionResults = await Promise.allSettled(
		files.map(({ bucket, path }) => supabase.storage.from(bucket).remove([path]))
	);

	let allSuccessful = true;

	deletionResults.forEach((result, index) => {
		const { bucket, path } = files[index];
		if (result.status === 'fulfilled') {
			if (result.value.error) {
				console.error(
					`Failed to delete file from "${bucket}" at "${path}": ${result.value.error.message}`
				);
				allSuccessful = false;
			} else {
				console.log(`Successfully deleted file from "${bucket}" at "${path}".`);
			}
		} else {
			console.error(`Error during deletion from "${bucket}" at "${path}": ${result.reason}`);
			allSuccessful = false;
		}
	});

	return allSuccessful;
}
