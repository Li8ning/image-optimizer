// File utility functions

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];

const validateFiles = (files) => {
    const validationErrors = [];
    const validFiles = [];

    files.forEach(file => {
        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            validationErrors.push({
                fileName: file.name,
                errorType: 'invalid_type',
                message: `File type ${file.type} is not supported. Allowed types: JPEG, PNG, WEBP, GIF, BMP, TIFF`
            });
            return;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            validationErrors.push({
                fileName: file.name,
                errorType: 'size_limit',
                message: `File size ${formatFileSize(file.size)} exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`
            });
            return;
        }

        // Check if file is actually an image by reading first few bytes
        if (file.type && !file.type.startsWith('image/')) {
            validationErrors.push({
                fileName: file.name,
                errorType: 'not_image',
                message: `File ${file.name} is not a valid image file`
            });
            return;
        }

        validFiles.push(file);
    });

    return { validFiles, validationErrors };
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const calculateSizeSavings = (originalSize, convertedSize) => {
    if (!originalSize || !convertedSize || originalSize <= 0) return '0.0';
    const savings = ((originalSize - convertedSize) / originalSize) * 100;
    return savings.toFixed(1);
};

const cleanupObjectURLs = (urls) => {
    if (Array.isArray(urls)) {
        urls.forEach(url => {
            if (typeof url === 'string' && url.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.warn('Failed to revoke object URL:', error);
                }
            }
        });
    }
};

const createTrackedObjectURL = (file) => {
    if (!file) return '';

    try {
        const objectUrl = URL.createObjectURL(file);
        console.log('Created object URL for preview:', file.name, objectUrl);
        return objectUrl;
    } catch (error) {
        console.error('Failed to create object URL for file:', file.name, error);
        return '';
    }
};

const createFileWithPreview = (file) => {
    try {
        const previewUrl = URL.createObjectURL(file);
        console.log('Created preview URL:', file.name, previewUrl);

        // Create a new object with all file properties explicitly copied
        const fileWithPreview = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            preview: previewUrl,
            previewReady: true,
            // Copy any other properties that might exist
            ...(file.webkitRelativePath && {webkitRelativePath: file.webkitRelativePath}),
            ...(file.path && {path: file.path}),
            ...(file.originalname && {originalname: file.originalname})
        };

        return { fileWithPreview, previewUrl };

    } catch (error) {
        console.error('Failed to create preview for file:', file.name, error);
        const fileWithError = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            preview: null,
            previewReady: false
        };
        return { fileWithError, previewUrl: null };
    }
};

export {
    validateFiles,
    formatFileSize,
    calculateSizeSavings,
    cleanupObjectURLs,
    createTrackedObjectURL,
    createFileWithPreview,
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES
};