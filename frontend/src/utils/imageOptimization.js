/**
 * Image optimization utilities
 * Provides helpers for image compression and validation
 */

/**
 * Maximum file size for menu item images (200KB)
 */
export const MAX_IMAGE_SIZE = 200 * 1024; // 200KB in bytes

/**
 * Supported image formats
 */
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validate image file size
 * @param {File} file - Image file to validate
 * @returns {boolean} - True if file size is acceptable
 */
export const validateImageSize = (file) => {
  return file.size <= MAX_IMAGE_SIZE;
};

/**
 * Validate image format
 * @param {File} file - Image file to validate
 * @returns {boolean} - True if format is supported
 */
export const validateImageFormat = (file) => {
  return SUPPORTED_FORMATS.includes(file.type);
};

/**
 * Compress image using canvas
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width (default: 800px)
 * @param {number} maxHeight - Maximum height (default: 800px)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Get human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Process and optimize image file for upload
 * @param {File} file - Original image file
 * @returns {Promise<{file: Blob, size: number, compressed: boolean}>}
 */
export const processImageForUpload = async (file) => {
  // Validate format
  if (!validateImageFormat(file)) {
    throw new Error('Unsupported image format. Please use JPEG, PNG, or WebP.');
  }
  
  // If already under size limit, return as is
  if (validateImageSize(file)) {
    return {
      file: file,
      size: file.size,
      compressed: false,
    };
  }
  
  // Compress image
  try {
    const compressedBlob = await compressImage(file);
    
    // Check if compression was successful
    if (compressedBlob.size <= MAX_IMAGE_SIZE) {
      return {
        file: compressedBlob,
        size: compressedBlob.size,
        compressed: true,
      };
    }
    
    // If still too large, try with lower quality
    const moreCompressedBlob = await compressImage(file, 800, 800, 0.6);
    
    if (moreCompressedBlob.size <= MAX_IMAGE_SIZE) {
      return {
        file: moreCompressedBlob,
        size: moreCompressedBlob.size,
        compressed: true,
      };
    }
    
    throw new Error(
      `Image is too large (${formatFileSize(moreCompressedBlob.size)}). ` +
      `Maximum size is ${formatFileSize(MAX_IMAGE_SIZE)}.`
    );
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

/**
 * Create a preview URL for an image file
 * @param {File|Blob} file - Image file
 * @returns {string} - Object URL for preview
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke preview URL to free memory
 * @param {string} url - Object URL to revoke
 */
export const revokeImagePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
