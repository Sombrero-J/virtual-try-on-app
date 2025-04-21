import type { Actions } from './$types';
import { uploadToStorage } from '$lib/server/database_helpers/storage';
import { fail } from '@sveltejs/kit';
import { rollbackStorage } from '$lib/server/database_helpers/storage';

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const actions: Actions = {
	upload: async ({ request, locals: { supabase } }) => {
		let uploadPath: string | null = null;

		try {
			const formData = await request.formData();
			const token = formData.get('token');
			const phoneImageEntry = formData.get('phone-image');

			if (!token) {
				return fail(400, { message: 'Session token is required.' });
			}
			const sessionToken = token.toString();

			if (!phoneImageEntry || !(phoneImageEntry instanceof File)) {
				return fail(400, { message: 'A valid phone image file is required.' });
			}
			const phoneImageFile = phoneImageEntry;

			if (phoneImageFile.size === 0) {
				return fail(400, { message: 'Uploaded file cannot be empty.' });
			}
			if (phoneImageFile.size > MAX_FILE_SIZE) {
				return fail(400, {
					message: `File size exceeds the limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`
				});
			}

			// Check file MIME type
			if (!ALLOWED_MIME_TYPES.includes(phoneImageFile.type)) {
				return fail(400, {
					message: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}.`
				});
			}

			// 2. Storage Upload
			console.log(
				`Attempting to upload file: ${phoneImageFile.name}, Size: ${phoneImageFile.size}`
			);

			// uploadToStorage should throw on failure
			uploadPath = await uploadToStorage('uploads', phoneImageFile, supabase, 'phone-upload');
			console.log(`File successfully uploaded to storage at path: ${uploadPath}`);

			// --- 3. Database Insert ---
			const { error: insertError } = await supabase.from('uploads').insert([
				{
					session_token: sessionToken,
					image_path: uploadPath
				}
			]);

			// --- 4. Handle DB Insert Result ---
			if (insertError) {
				// Log the specific Supabase error
				console.error('Supabase insert error:', insertError);

				console.log(`DB insert failed, attempting rollback for path: ${uploadPath}`);
				let rollbackMessage = 'Error saving record to database.';
				try {
					const rollbackSuccess = await rollbackStorage(supabase, [
						{ bucket: 'uploads', path: uploadPath }
					]);
					rollbackMessage += rollbackSuccess
						? ' Storage rollback completed.'
						: ' Storage rollback attempt failed.';
					console.log(rollbackMessage);
				} catch (rollbackErr) {
					console.error('Error during storage rollback:', rollbackErr);
					rollbackMessage += ' Error occurred during storage rollback.';
				}
				return fail(500, { message: rollbackMessage });
			}

			// --- 5. Success ---
			return { success: true, message: 'Image submitted successfully.' };
		} catch (err) {
			// --- 6. Catch-All Error Handler ---
			console.error('Unexpected error in upload action:', err);

			// Check if it's an error potentially thrown by uploadToStorage before path was set
			// If an uploadPath exists, still try to rollback just in case upload partially succeeded before error.
			// This is defensive coding; ideally uploadToStorage cleans up on its own internal errors.
			if (uploadPath) {
				console.warn(
					`Unexpected error occurred after file upload (path: ${uploadPath}), attempting rollback.`
				);
				try {
					await rollbackStorage(supabase, [{ bucket: 'uploads', path: uploadPath }]);
					console.log('Defensive rollback attempted.');
				} catch (rollbackErr) {
					console.error('Error during defensive rollback:', rollbackErr);
				}
			}

			return fail(500, {
				message: 'An unexpected server error occurred during the upload process.'
			});
		}
	}
};
