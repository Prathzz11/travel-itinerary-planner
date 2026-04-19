import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * 
 * @param {File} imageFile - The original image file from an input element
 * @param {Object} [options] - Optional custom configuration
 * @returns {Promise<File>} A promise that resolves to the compressed image file
 */
export const compressImage = async (imageFile, options = {}) => {
  // If no file or it's not an image, return as is
  if (!imageFile || !imageFile.type.startsWith('image/')) {
    return imageFile;
  }

  const defaultOptions = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width/height to scale down to
    useWebWorker: true, // Use a web worker to prevent main thread blocking
    ...options
  };

  try {
    const compressedFile = await imageCompression(imageFile, defaultOptions);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, gracefully degrade to returning the original file
    return imageFile;
  }
};

/**
 * Utility to compress an image and convert it directly to a base64 DataURL
 * Useful for immediate UI previews or storing small avatars
 * 
 * @param {File} imageFile 
 * @returns {Promise<string>} Base64 encoded string
 */
export const compressImageToDataUrl = async (imageFile) => {
  try {
    const compressedFile = await compressImage(imageFile, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800
    });
    return await imageCompression.getDataUrlFromFile(compressedFile);
  } catch (error) {
    console.error('Error getting data URL:', error);
    return null;
  }
};
