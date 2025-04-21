import imageCompression from 'browser-image-compression';

const compressionOptions = {
	maxSizeMB: 1, // Max file size in MB
	maxWidthOrHeight: 1920, // Max width or height
	useWebWorker: true, // Use multi-threading for performance
	fileType: 'image/webp'
};

export async function compressAndPreview(file: File): Promise<{
	compressedFile: File;
	compressedPreviewUrl: string;
}> {
	try {
		console.log('original size: ', file.size / 1024 / 1024, 'MB');
		const compressedBlob = await imageCompression(file, compressionOptions);

		const originalFilename = file.name;
		const lastDotIndex = originalFilename.lastIndexOf('.');

		// Extract base name (part before the last dot)
		// Handles cases with no extension or files starting with '.'
		const baseName =
			lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;

		// Extract new extension from the compressed blob's MIME type
		let newExtension = 'unknown'; // Fallback extension
		const mimeType = compressedBlob.type; // e.g., "image/jpeg", "image/png"
		if (mimeType && mimeType.startsWith('image/')) {
			newExtension = mimeType.substring(6); // Get the part after "image/" (e.g., "jpeg", "png")
			if (!newExtension) {
				console.warn(`Could not extract extension from MIME type: ${mimeType}`);
				newExtension = 'bin'; // Or another fallback
			}
		} else {
			console.warn(
				`Compressed blob has unexpected MIME type: ${mimeType}. Using fallback extension.`
			);
			// You might want a more specific fallback based on expected outputs
			// For browser-image-compression, common outputs are jpeg, png, webp, gif
			if (mimeType?.includes('jpeg')) newExtension = 'jpeg';
			else if (mimeType?.includes('png')) newExtension = 'png';
			else if (mimeType?.includes('webp')) newExtension = 'webp';
			else if (mimeType?.includes('gif')) newExtension = 'gif';
			else newExtension = 'bin'; // General binary fallback
		}

		const newFilename = `${baseName}.${newExtension}`;

		// Create a new File object from the Blob to preserve the filename
		const compressedFile = new File([compressedBlob], newFilename, {
			type: compressedBlob.type,
			lastModified: Date.now()
		});

		const compressedSize = compressedFile.size;
		const compressedPreviewUrl = URL.createObjectURL(compressedFile); // Use compressedFile (which is a Blob)

		console.log(
			`Compressed File: ${compressedFile.name}, Size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB, Type: ${compressedFile.type}`
		);

		return {
			compressedFile,
			compressedPreviewUrl
		};
	} catch (error) {
		console.error('Compression Error:', error);

		// return original file
		const compressedPreviewUrl = URL.createObjectURL(file);

		return {
			compressedFile: file,
			compressedPreviewUrl
		};
	}
}
