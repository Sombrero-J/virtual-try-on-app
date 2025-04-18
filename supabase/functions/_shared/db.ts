import { SupabaseClient } from 'jsr:@supabase/supabase-js@^2';

export async function updateSessionStatusOnError(
	client: SupabaseClient,
	try_on_id: number | null,
	outfits_id: number | null,
	errorMessage: string,
	taskId: string | undefined
): Promise<void> {
	console.warn(
		`VTO Process: Attempting to update session ${try_on_id} status to 'error' due to: ${errorMessage}`
	);

	if (try_on_id) {
		const { error: updateDbError } = await client
			.from('try_on_sessions')
			.update({
				status: 'error',
				error: errorMessage,
				task_id: taskId
			})
			.eq('id', try_on_id);

		if (updateDbError) {
			console.error(
				`VTO Process CRITICAL: Failed to update session ${try_on_id} with error status: ${updateDbError.message}. Original error: ${errorMessage}`
			);
		}
	} else if (outfits_id) {
		const { error: updateDbError } = await client
			.from('outfits')
			.update({
				status: 'error',
				error: errorMessage,
				task_id: taskId
			})
			.eq('id', outfits_id);

		if (updateDbError) {
			console.error(
				`VTO Process CRITICAL: Failed to update session ${outfits_id} with error status: ${updateDbError.message}. Original error: ${errorMessage}`
			);
		}
	} else {
		console.error(
			`VTO Process CRITICAL: No valid session ID provided to update status. Error: ${errorMessage}`
		);
	}
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
