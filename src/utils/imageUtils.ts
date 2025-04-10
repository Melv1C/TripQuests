import convert from 'heic-convert/browser';

/**
 * Checks if a file is a HEIC/HEIF image based on its file extension
 *
 * @param file The file to check
 * @returns boolean indicating if the file is a HEIC/HEIF image
 */
export const isHeicImage = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.heic') || fileName.endsWith('.heif');
};

/**
 * Converts a HEIC/HEIF image to JPEG format
 *
 * @param file The HEIC/HEIF file to convert
 * @param quality JPEG quality (0-1, default: 0.9)
 * @returns Promise resolving to a File object containing the converted JPEG
 */
export const convertHeicToJpeg = async (
    file: File,
    quality = 0.9
): Promise<File> => {
    try {
        // Convert blob to ArrayBuffer
        const inputBuffer = await file.arrayBuffer();

        // Create a Uint8Array from the ArrayBuffer for compatibility
        const uint8Array = new Uint8Array(inputBuffer);

        // Convert using heic-convert with Uint8Array instead of ArrayBuffer
        const outputBuffer = await convert({
            buffer: uint8Array, // Use Uint8Array instead of ArrayBuffer
            format: 'JPEG',
            quality,
        });

        // Create a new Blob and then a File from the converted buffer
        const jpegBlob = new Blob([outputBuffer], { type: 'image/jpeg' });

        // Generate new filename with .jpg extension
        const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');

        return new File([jpegBlob], fileName, { type: 'image/jpeg' });
    } catch (error) {
        console.error('HEIC conversion error:', error);
        // Add more specific error information
        const errorMessage =
            error instanceof Error
                ? `${error.name}: ${error.message}`
                : 'Unknown error during HEIC conversion';

        throw new Error(
            `Failed to convert HEIC image: ${errorMessage}. Please try a different image format.`
        );
    }
};

/**
 * Processes an image file, converting it from HEIC to JPEG if necessary
 *
 * @param file The input file
 * @returns Promise resolving to the processed file (converted if it was HEIC)
 */
export const processImageFile = async (file: File): Promise<File> => {
    if (isHeicImage(file)) {
        return await convertHeicToJpeg(file);
    }
    return file;
};
