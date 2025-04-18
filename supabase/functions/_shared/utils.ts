export async function getImageData(imageOrigin: string, filename: string): Promise<File> {
	const res = await fetch(imageOrigin);
	const blob = await res.blob();
	return new File([blob], filename, { type: blob.type });
}

export function createErrorResponse(message: string, status: number = 500): Response {
	console.error(`Returning ${status} Error: ${message}`); // Log the error server-side
	return new Response(JSON.stringify({ success: false, message: message }), {
		status: status,
		headers: {
			'Content-Type': 'application/json'
			// ...corsHeaders // Include CORS headers if needed
		}
	});
}