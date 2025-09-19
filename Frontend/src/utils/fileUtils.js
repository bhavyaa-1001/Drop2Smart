/**
 * File Handling Utilities
 * 
 * Contains functions for handling file uploads, image processing,
 * and file validation operations.
 */

/**
 * Convert file to base64 data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} Promise that resolves to base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file: ' + error.message));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Resize image to specified dimensions while maintaining aspect ratio
 * @param {File|string} imageSource - Image file or base64 data URL
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - Image quality (0-1) for JPEG compression
 * @returns {Promise<string>} Promise that resolves to resized image data URL
 */
export const resizeImage = (imageSource, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL with compression
        const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };
      
      // Load image source
      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof File) {
        const dataUrl = await fileToBase64(imageSource);
        img.src = dataUrl;
      } else {
        reject(new Error('Invalid image source type'));
      }
    } catch (error) {
      reject(new Error('Image resizing failed: ' + error.message));
    }
  });
};

/**
 * Compress image file while maintaining reasonable quality
 * @param {File} file - Image file to compress
 * @param {number} maxSizeKB - Maximum file size in KB
 * @param {number} initialQuality - Initial compression quality (0-1)
 * @returns {Promise<string>} Promise that resolves to compressed image data URL
 */
export const compressImage = async (file, maxSizeKB = 500, initialQuality = 0.8) => {
  try {
    let quality = initialQuality;
    let compressedDataUrl = await resizeImage(file, 1920, 1080, quality);
    
    // Estimate file size (base64 is ~33% larger than actual file)
    const estimatedSizeKB = (compressedDataUrl.length * 0.75) / 1024;
    
    // Reduce quality if file is still too large
    while (estimatedSizeKB > maxSizeKB && quality > 0.1) {
      quality -= 0.1;
      compressedDataUrl = await resizeImage(file, 1920, 1080, quality);
      const newEstimatedSizeKB = (compressedDataUrl.length * 0.75) / 1024;
      
      if (newEstimatedSizeKB <= maxSizeKB) break;
    }
    
    return compressedDataUrl;
  } catch (error) {
    throw new Error('Image compression failed: ' + error.message);
  }
};

/**
 * Extract image metadata and dimensions
 * @param {File|string} imageSource - Image file or data URL
 * @returns {Promise<Object>} Promise that resolves to image metadata
 */
export const getImageInfo = (imageSource) => {
  return new Promise(async (resolve, reject) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        const info = {
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          orientation: img.width > img.height ? 'landscape' : 
                      img.width < img.height ? 'portrait' : 'square'
        };
        
        // Add file-specific info if source is a File
        if (imageSource instanceof File) {
          info.fileName = imageSource.name;
          info.fileSize = imageSource.size;
          info.fileType = imageSource.type;
          info.lastModified = new Date(imageSource.lastModified);
        }
        
        resolve(info);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for analysis'));
      };
      
      // Load image source
      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof File) {
        const dataUrl = await fileToBase64(imageSource);
        img.src = dataUrl;
      } else {
        reject(new Error('Invalid image source type'));
      }
    } catch (error) {
      reject(new Error('Image analysis failed: ' + error.message));
    }
  });
};

/**
 * Create image thumbnail
 * @param {File|string} imageSource - Image file or data URL
 * @param {number} size - Thumbnail size (square dimensions)
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<string>} Promise that resolves to thumbnail data URL
 */
export const createThumbnail = async (imageSource, size = 150, quality = 0.7) => {
  try {
    return await resizeImage(imageSource, size, size, quality);
  } catch (error) {
    throw new Error('Thumbnail creation failed: ' + error.message);
  }
};

/**
 * Validate file type against allowed types
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @returns {boolean} Whether file type is allowed
 */
export const isValidFileType = (file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']) => {
  if (!file || !file.type) return false;
  return allowedTypes.includes(file.type.toLowerCase());
};

/**
 * Validate file size against maximum allowed size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} Whether file size is within limits
 */
export const isValidFileSize = (file, maxSizeMB = 10) => {
  if (!file || !file.size) return false;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Generate unique filename with timestamp
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  
  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const prefixPart = prefix ? prefix + '_' : '';
  
  return `${prefixPart}${cleanBaseName}_${timestamp}_${random}.${extension}`;
};

/**
 * Download file from data URL
 * @param {string} dataUrl - Data URL of the file
 * @param {string} filename - Filename for download
 */
export const downloadFile = (dataUrl, filename) => {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('File download failed:', error);
    throw new Error('File download failed: ' + error.message);
  }
};

/**
 * Copy text or data URL to clipboard
 * @param {string} text - Text or data URL to copy
 * @returns {Promise<boolean>} Promise that resolves to success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Create a File object from data URL
 * @param {string} dataUrl - Data URL to convert
 * @param {string} filename - Filename for the created file
 * @returns {File} File object
 */
export const dataUrlToFile = (dataUrl, filename) => {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    throw new Error('Data URL to File conversion failed: ' + error.message);
  }
};

/**
 * Batch process multiple files
 * @param {FileList|Array<File>} files - Files to process
 * @param {Function} processor - Processing function for each file
 * @param {number} concurrency - Maximum concurrent operations
 * @returns {Promise<Array>} Promise that resolves to array of results
 */
export const batchProcessFiles = async (files, processor, concurrency = 3) => {
  const fileArray = Array.from(files);
  const results = [];
  
  for (let i = 0; i < fileArray.length; i += concurrency) {
    const batch = fileArray.slice(i, i + concurrency);
    const batchPromises = batch.map(async (file, index) => {
      try {
        return await processor(file, i + index);
      } catch (error) {
        return { error: error.message, file: file.name };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Create drag and drop handlers for file upload
 * @param {Function} onFilesSelected - Callback when files are selected
 * @param {Array<string>} allowedTypes - Allowed file types
 * @param {boolean} multiple - Allow multiple files
 * @returns {Object} Drag and drop event handlers
 */
export const createDragDropHandlers = (onFilesSelected, allowedTypes = ['image/*'], multiple = false) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    
    // Filter files by allowed types
    const validFiles = files.filter(file => {
      return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category + '/');
        }
        return file.type === type;
      });
    });
    
    // Handle single vs multiple file selection
    const selectedFiles = multiple ? validFiles : validFiles.slice(0, 1);
    
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };
  
  return {
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };
};

/**
 * Check if current browser supports required file APIs
 * @returns {Object} Support status for various APIs
 */
export const checkFileAPISupport = () => {
  return {
    fileReader: typeof FileReader !== 'undefined',
    canvas: typeof HTMLCanvasElement !== 'undefined',
    dragDrop: 'draggable' in document.createElement('div'),
    clipboard: navigator.clipboard && navigator.clipboard.writeText,
    webp: document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')
  };
};