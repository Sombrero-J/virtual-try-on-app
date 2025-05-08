import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

interface UploadPayload {
	image_path: string;
	// Add more fields if needed (e.g., session_token, file_name, etc.)
}

/**
 * Subscribes to new uploads for a given session token.
 *
 * @param supabase - Your Supabase client instance.
 * @param token - The session token to filter uploads.
 * @param onFileReceived - Callback invoked with the File object when an upload is received.
 * @returns A RealtimeChannel subscription.
 */
export function subscribeToUploadChanges(
	supabase: SupabaseClient,
	token: string,
	onFileReceived: (newFile: File) => void
): RealtimeChannel {
	const channel: RealtimeChannel = supabase
		.channel('changes')
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'uploads',
				filter: `session_token=eq.${token}`
			},
			async (payload) => {
				// Cast payload.new to our UploadPayload interface
				const newPayload = payload.new as UploadPayload;

				// Download the file from storage
				const { data, error } = await supabase.storage
					.from('uploads')
					.download(newPayload.image_path);

				if (error) {
					console.error('Error downloading file:', error);
					return;
				}

				if (!error && data) {
					// Extract the filename: use everything after the first dash
					const parts = newPayload.image_path.split('-');
					const fileName = parts.length > 1 ? parts.slice(1).join('-') : newPayload.image_path;

					// Convert the Blob to a File
					const file = new File([data], fileName, {
						type: data.type,
						lastModified: Date.now()
					});

					onFileReceived(file);
				} else {
					console.error('Error downloading file:', error);
				}
			}
		)
		.subscribe((status, err) => {
			// handle subscription status changes or errors
			if (status === 'SUBSCRIBED') {
				console.log(`Realtime channel subscribed successfully!`);
			} else if (status === 'CHANNEL_ERROR') {
				console.error(`Realtime channel error:`, err);
			} else if (status === 'TIMED_OUT') {
				console.warn(`Realtime channel timeout.`);
			} else {
				console.log(`Realtime channel status: ${status}`);
			}
		});

	return channel;
}

/**
 * Subscribes to new uploads for a given session token.
 *
 * @param supabase - Your Supabase client instance.
 * @param token - The session token to filter uploads.
 * @param onFileReceived - Callback invoked with the File object when an upload is received.
 * @returns A RealtimeChannel subscription.
 */
export function subscribeToOutfitGeneration(
	supabase: SupabaseClient,
	user_id: string,
	onFileReceived: (newFile: File) => void
): RealtimeChannel {
	const channel: RealtimeChannel = supabase
		.channel('outfit_changes')
		.on(
			'postgres_changes',
			{
				event: 'UPDATE',
				schema: 'public',
				table: 'outfits',
				filter: `status=eq.done`
			},
			async (payload) => {
				const newPayload = payload.new as {
					id: number;
					status: string;
					user_id: string;
					cover_image_url: string;
				};

				console.log('Received payload:', newPayload);

				if (newPayload.user_id !== user_id) {
					console.log('User ID does not match. Ignoring payload.');
					return;
				}

				// Download the file from storage
				const { data, error } = await supabase.storage
					.from('tryon')
					.download(newPayload.cover_image_url);

				if (error) {
					console.error('Error downloading file:', error);
					return;
				}

				if (!error && data) {
					// Extract the filename: use everything after the first dash
					const parts = newPayload.cover_image_url.split('-');
					const fileName = parts.length > 1 ? parts.slice(1).join('-') : newPayload.cover_image_url;

					// Convert the Blob to a File
					const file = new File([data], fileName, {
						type: data.type,
						lastModified: Date.now()
					});

					onFileReceived(file);
				} else {
					console.error('Error downloading file:', error);
				}
			}
		)
		.subscribe((status, err) => {
			// handle subscription status changes or errors
			if (status === 'SUBSCRIBED') {
				console.log(`Outfits_changes realtime channel subscribed successfully!`);
			} else if (status === 'CHANNEL_ERROR') {
				console.error(`Outfits_changes realtime channel error:`, err);
			} else if (status === 'TIMED_OUT') {
				console.warn(`Outfits_changes realtime channel timeout.`);
			} else {
				console.log(`Outfits_changes realtime channel status: ${status}`);
			}
		});

	return channel;
}
