import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [images, setImages] = useState([]);
    const [convertedImages, setConvertedImages] = useState([]);
    const [isConverting, setIsConverting] = useState(false);
    const [resizeWidth, setResizeWidth] = useState(0);
    const [quality, setQuality] = useState(80);
    const [isDragging, setIsDragging] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonIndex, setComparisonIndex] = useState(0);
    const [preset, setPreset] = useState('Custom');
    const [errors, setErrors] = useState([]);
    const [retryQueue, setRetryQueue] = useState([]);

    // Track all created object URLs for cleanup
    const [objectURLs, setObjectURLs] = useState([]);

    // General cleanup utility function
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

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            // Cleanup all tracked object URLs
            cleanupObjectURLs(objectURLs);
            setObjectURLs([]);
        };
    }, []);

    // Track object URLs created during render without causing re-renders
    useEffect(() => {
        // Collect all object URLs from images and converted images
        const urlsToTrack = [];
        
        // Track URLs from uploaded images
        images.forEach(file => {
            if (file?.preview && typeof file.preview === 'string' && file.preview.startsWith('blob:')) {
                urlsToTrack.push(file.preview);
            }
        });
        
        // Track URLs from converted images
        convertedImages.forEach(image => {
            if (image?.url && typeof image.url === 'string' && image.url.startsWith('blob:')) {
                urlsToTrack.push(image.url);
            }
        });
        
        // Update tracked URLs if there are new ones
        if (urlsToTrack.length > 0) {
            setObjectURLs(prev => {
                // Only add URLs that aren't already tracked
                const newUrls = urlsToTrack.filter(url => !prev.includes(url));
                if (newUrls.length > 0) {
                    console.log('Tracking new object URLs:', newUrls.length);
                    return Array.isArray(prev) ? [...prev, ...newUrls] : [...newUrls];
                }
                return prev;
            });
        }
    }, [images, convertedImages]);

    // Create object URL with tracking
    const createTrackedObjectURL = (file) => {
        if (!file) return '';
        
        try {
            const objectUrl = URL.createObjectURL(file);
            console.log('Created object URL for preview:', file.name, objectUrl);
            // Use useEffect to track object URLs to avoid state updates during render
            return objectUrl;
        } catch (error) {
            console.error('Failed to create object URL for file:', file.name, error);
            return '';
        }
    };

    // Test memory cleanup functionality
    const testMemoryCleanup = () => {
        console.log('Testing memory cleanup...');
        console.log('Current tracked object URLs:', objectURLs.length);
        
        // Test cleanup function
        const testUrls = ['blob:test1', 'blob:test2', 'invalid-url'];
        cleanupObjectURLs(testUrls);
        
        console.log('Cleanup test completed');
        toast.info('🧪 Memory cleanup test completed - check console for details');
    };

    // Preset configurations
    const presets = {
        'Custom': { quality: 80, resizeWidth: 0 },
        'Web': { quality: 75, resizeWidth: 1200 },
        'Print': { quality: 95, resizeWidth: 0 },
        'Social Media': { quality: 85, resizeWidth: 1600 }
    };

    // File validation constants
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        console.log('DEBUG: Files selected:', files.length, files.map(f => ({name: f.name, type: f.type, size: f.size, lastModified: f.lastModified})));
        
        // Debug: Check if any of these files were recently removed
        const currentImageNames = images.map(img => img.name);
        files.forEach(file => {
            if (currentImageNames.includes(file.name)) {
                console.log('DEBUG: File was previously removed and is being re-added:', file.name);
            }
        });
        
        const { validFiles, validationErrors } = validateFiles(files);

        if (validationErrors.length > 0) {
            setErrors(prevErrors => [...prevErrors, ...validationErrors]);
            validationErrors.forEach(error => {
                toast.error(`❌ ${error.message}`);
            });
        }
if (validFiles.length > 0) {
    console.log('DEBUG: Processing valid files for upload:', validFiles.map(f => ({name: f.name, size: f.size})));
    console.log('DEBUG: Valid files to process:', validFiles.length, validFiles.map(f => ({name: f.name, type: f.type})));
    
    // Create preview URLs and track them all at once
    const filesWithPreviews = [];
    const newObjectURLs = [];
     
    validFiles.forEach(file => {
        try {
            console.log('DEBUG: Creating preview URL for:', file.name, 'Type:', file.type, 'Size:', file.size);
            const previewUrl = URL.createObjectURL(file);
            console.log('DEBUG: Created preview URL:', file.name, previewUrl);
            
            // Debug: Check if the file has the expected properties
            console.log('DEBUG: File properties:', {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                webkitRelativePath: file.webkitRelativePath
            });
             
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
            
            filesWithPreviews.push(fileWithPreview);
            newObjectURLs.push(previewUrl);
            
            console.log('DEBUG: Created file with preview:', {
                name: fileWithPreview.name,
                preview: fileWithPreview.preview,
                previewReady: fileWithPreview.previewReady
            });
             
        } catch (error) {
            console.error('DEBUG: Failed to create preview for file:', file.name, error);
            const fileWithError = {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                preview: null,
                previewReady: false
            };
            filesWithPreviews.push(fileWithError);
        }
    });
     
    console.log('DEBUG: Files with previews created:', filesWithPreviews.length);
    console.log('DEBUG: New object URLs:', newObjectURLs.length);
    
    // Update both states at once to avoid race conditions
    // Use functional updates to ensure we have the latest state
    setImages(prevImages => {
        const updatedImages = [...prevImages, ...filesWithPreviews];
        console.log('DEBUG: Images state updated. Total images now:', updatedImages.length);
        console.log('DEBUG: Updated images array:', updatedImages.map(img => ({name: img.name, previewReady: img.previewReady})));
        
        // Force re-render by returning new array
        return [...updatedImages];
    });
    
    setObjectURLs(prev => {
        const updatedURLs = [...prev, ...newObjectURLs];
        console.log('DEBUG: Object URLs state updated. Total URLs now:', updatedURLs.length);
        
        // Force re-render by returning new array
        return [...updatedURLs];
    });
     
    // Debug: Check if the images are actually being rendered
    // Use useEffect-style logging to avoid stale state references
    setTimeout(() => {
        // Log the files that were just processed instead of relying on state
        console.log('DEBUG: Files that should have been added:', filesWithPreviews.map(img => ({name: img.name, preview: img.preview, previewReady: img.previewReady})));
        console.log('DEBUG: Object URLs that should have been added:', newObjectURLs);
    }, 100);
     
    toast.success(`✅ ${validFiles.length} file(s) uploaded successfully`);
    
    // Fix: Reset the file input to allow re-selecting the same files
    // This prevents the browser from caching the file selection
    setTimeout(() => {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
            console.log('DEBUG: File input reset to allow re-selection of same files');
        }
    }, 100);
}
    };

    const handleRemoveFile = (index) => {
        // Cleanup the object URL before removing the file
        const fileToRemove = images[index];
        console.log('DEBUG: Removing file:', {
            name: fileToRemove?.name,
            preview: fileToRemove?.preview,
            index: index,
            currentImages: images.length
        });
        
        if (fileToRemove && fileToRemove.preview) {
            try {
                URL.revokeObjectURL(fileToRemove.preview);
                console.log('DEBUG: Successfully revoked object URL for:', fileToRemove.name);
            } catch (error) {
                console.error('DEBUG: Failed to revoke object URL:', error);
            }
        }
        
        const newImages = [...images];
        newImages.splice(index, 1);
        
        console.log('DEBUG: After removal - images count:', newImages.length);
        
        setImages(newImages);
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

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = Array.from(e.dataTransfer.files);
        const { validFiles, validationErrors } = validateFiles(files);

        if (validationErrors.length > 0) {
            setErrors(prevErrors => [...prevErrors, ...validationErrors]);
            validationErrors.forEach(error => {
                toast.error(`❌ ${error.message}`);
            });
        }

        if (validFiles.length > 0) {
            // Create preview URLs and track them all at once
            const filesWithPreviews = [];
            const newObjectURLs = [];
             
            validFiles.forEach(file => {
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
                    
                    filesWithPreviews.push(fileWithPreview);
                    newObjectURLs.push(previewUrl);
                    
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
                    filesWithPreviews.push(fileWithError);
                }
            });
             
            // Update both states at once to avoid race conditions
            setImages(prevImages => {
                const updatedImages = [...prevImages, ...filesWithPreviews];
                return [...updatedImages]; // Force re-render
            });
            setObjectURLs(prev => {
                const updatedURLs = [...prev, ...newObjectURLs];
                return [...updatedURLs]; // Force re-render
            });
             
            toast.success(`✅ ${validFiles.length} file(s) uploaded successfully`);
            
            // Fix: Reset the file input to allow re-selecting the same files via drag and drop
            setTimeout(() => {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.value = '';
                    console.log('DEBUG: File input reset after drag and drop upload');
                }
            }, 100);
        }
    };

    const handlePresetChange = (e) => {
        const selectedPreset = e.target.value;
        setPreset(selectedPreset);
        
        // Apply preset settings
        const presetSettings = presets[selectedPreset];
        setQuality(presetSettings.quality);
        setResizeWidth(presetSettings.resizeWidth);
    };

    const handleConvert = async () => {
        if (images.length === 0) {
            toast.warning('⚠️ Please upload at least one image to convert');
            return;
        }

        // Validate settings
        if (quality < 1 || quality > 100) {
            toast.error('❌ Quality must be between 1 and 100');
            return;
        }

        if (resizeWidth < 0 || resizeWidth > 10000) {
            toast.error('❌ Resize width must be between 0 and 10000 pixels');
            return;
        }

        setIsConverting(true);
        setErrors([]);
        const formData = new FormData();
        
        // Debug: Log what we're trying to send
        console.log('DEBUG: Attempting to convert images:', images.map(img => ({name: img.name, type: img.type, size: img.size})));
        
        // Create File objects from the enhanced image objects
        for (const image of images) {
            try {
                // Create a new File object from the preview URL
                // This reconstructs the original file for upload
                if (image.preview && image.preview.startsWith('blob:')) {
                    // Fetch the blob from the object URL
                    const response = await fetch(image.preview);
                    const blob = await response.blob();
                    const file = new File([blob], image.name, { type: image.type });
                    formData.append('images', file, image.name);
                    console.log('DEBUG: Successfully created File for upload:', file.name, file.type, file.size);
                } else {
                    // Fallback: try to use the original file if available
                    console.warn('DEBUG: No valid preview URL for image:', image.name);
                    formData.append('images', image, image.name);
                }
            } catch (error) {
                console.error('DEBUG: Failed to create File for upload:', image.name, error);
                toast.error(`❌ Failed to prepare ${image.name} for conversion: ${error.message}`);
            }
        }
        
        formData.append('resizeWidth', resizeWidth);
        formData.append('quality', quality);

        try {
            const response = await fetch('http://localhost:3001/convert', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.errors && data.errors.length > 0) {
                const conversionErrors = data.errors.map(error => ({
                    fileName: error.filename,
                    errorType: 'conversion_failed',
                    message: `Failed to convert ${error.filename}: ${error.error}`,
                    originalError: error.error
                }));
                 
                setErrors(prevErrors => [...prevErrors, ...conversionErrors]);
                conversionErrors.forEach(error => {
                    toast.error(`❌ ${error.message}`);
                });
                 
                // Add failed files to retry queue
                const failedFiles = data.errors.map(error =>
                    images.find(img => img.name === error.filename)
                ).filter(Boolean);
                 
                if (failedFiles.length > 0) {
                    setRetryQueue(prevQueue => [...prevQueue, ...failedFiles]);
                    toast.info(`ℹ️ ${failedFiles.length} file(s) added to retry queue`);
                }
            }

            if (data.convertedImages && data.convertedImages.length > 0) {
                // Fetch converted images and create object URLs for previews
                const fetchConvertedImages = async () => {
                    const imagesWithPreviews = [];
                    const newObjectURLs = [];
                    
                    for (const image of data.convertedImages) {
                        try {
                            // Fetch the converted image from the server
                            const response = await fetch(`http://localhost:3001${image.url}`);
                            const blob = await response.blob();
                            
                            // Create object URL for preview
                            const previewUrl = URL.createObjectURL(blob);
                            
                            // Create enhanced image object with preview
                            const imageWithPreview = {
                                ...image,
                                preview: previewUrl,
                                previewReady: true
                            };
                            
                            imagesWithPreviews.push(imageWithPreview);
                            newObjectURLs.push(previewUrl);
                            
                            console.log('DEBUG: Created preview for converted image:', image.name, previewUrl);
                            
                        } catch (error) {
                            console.error('DEBUG: Failed to create preview for converted image:', image.name, error);
                            
                            // Add image without preview if fetch fails
                            imagesWithPreviews.push({
                                ...image,
                                preview: null,
                                previewReady: false
                            });
                        }
                    }
                    
                    // Update both converted images and object URLs
                    setConvertedImages(imagesWithPreviews);
                    setObjectURLs(prev => [...prev, ...newObjectURLs]);
                    
                    toast.success(`✅ Successfully converted ${imagesWithPreviews.length} image(s)`);
                };
                
                fetchConvertedImages();
            }

        } catch (error) {
            console.error('Error converting images:', error);
            const errorMessage = error.message.includes('Failed to fetch')
                ? 'Network error: Could not connect to the conversion server'
                : `Conversion error: ${error.message}`;
             
            setErrors(prevErrors => [...prevErrors, {
                errorType: 'network_error',
                message: errorMessage,
                originalError: error.message
            }]);
             
            toast.error(`❌ ${errorMessage}`);
             
            // Add all files to retry queue on network error
            setRetryQueue(images);
            toast.info(`ℹ️ All files added to retry queue due to network error`);

        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = (filename) => {
        window.location.href = `http://localhost:3001/download/${filename}`;
    };

    const handleRetryConversion = async () => {
        if (retryQueue.length === 0) {
            toast.warning('⚠️ No files in retry queue');
            return;
        }

        setIsConverting(true);
        const formData = new FormData();
        
        // Create File objects from the enhanced image objects in retry queue
        for (const image of retryQueue) {
            try {
                if (image.preview && image.preview.startsWith('blob:')) {
                    const response = await fetch(image.preview);
                    const blob = await response.blob();
                    const file = new File([blob], image.name, { type: image.type });
                    formData.append('images', file, image.name);
                    console.log('DEBUG: Successfully created File for retry:', file.name);
                } else {
                    console.warn('DEBUG: No valid preview URL for retry image:', image.name);
                    formData.append('images', image, image.name);
                }
            } catch (error) {
                console.error('DEBUG: Failed to create File for retry:', image.name, error);
                toast.error(`❌ Failed to prepare ${image.name} for retry: ${error.message}`);
            }
        }
        
        formData.append('resizeWidth', resizeWidth);
        formData.append('quality', quality);

        try {
            const response = await fetch('http://localhost:3001/convert', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.errors && data.errors.length > 0) {
                const conversionErrors = data.errors.map(error => ({
                    fileName: error.filename,
                    errorType: 'retry_conversion_failed',
                    message: `Retry failed for ${error.filename}: ${error.error}`,
                    originalError: error.error
                }));
                
                setErrors(prevErrors => [...prevErrors, ...conversionErrors]);
                conversionErrors.forEach(error => {
                    toast.error(`❌ ${error.message}`);
                });
            }

            if (data.convertedImages && data.convertedImages.length > 0) {
                // Fetch converted images and create object URLs for previews
                const fetchConvertedImages = async () => {
                    const imagesWithPreviews = [];
                    const newObjectURLs = [];
                    
                    for (const image of data.convertedImages) {
                        try {
                            // Fetch the converted image from the server
                            const response = await fetch(`http://localhost:3001${image.url}`);
                            const blob = await response.blob();
                            
                            // Create object URL for preview
                            const previewUrl = URL.createObjectURL(blob);
                            
                            // Create enhanced image object with preview
                            const imageWithPreview = {
                                ...image,
                                preview: previewUrl,
                                previewReady: true
                            };
                            
                            imagesWithPreviews.push(imageWithPreview);
                            newObjectURLs.push(previewUrl);
                            
                            console.log('DEBUG: Created preview for retry converted image:', image.name, previewUrl);
                            
                        } catch (error) {
                            console.error('DEBUG: Failed to create preview for retry converted image:', image.name, error);
                            
                            // Add image without preview if fetch fails
                            imagesWithPreviews.push({
                                ...image,
                                preview: null,
                                previewReady: false
                            });
                        }
                    }
                    
                    // Update both converted images and object URLs
                    setConvertedImages(prevImages => [...prevImages, ...imagesWithPreviews]);
                    setObjectURLs(prev => [...prev, ...newObjectURLs]);
                    
                    toast.success(`✅ Successfully converted ${imagesWithPreviews.length} file(s) on retry`);
                    
                    // Remove successfully converted files from retry queue
                    const successfullyConvertedNames = imagesWithPreviews.map(img => img.name);
                    setRetryQueue(prevQueue =>
                        prevQueue.filter(file =>
                            !successfullyConvertedNames.some(name => name.includes(file.name))
                        )
                    );
                };
                
                fetchConvertedImages();
            }

        } catch (error) {
            console.error('Error during retry conversion:', error);
            const errorMessage = error.message.includes('Failed to fetch')
                ? 'Network error: Could not connect to the conversion server'
                : `Retry error: ${error.message}`;
            
            setErrors(prevErrors => [...prevErrors, {
                errorType: 'retry_network_error',
                message: errorMessage,
                originalError: error.message
            }]);
            
            toast.error(`❌ ${errorMessage}`);

        } finally {
            setIsConverting(false);
        }
    };

    const handleClearErrors = () => {
        setErrors([]);
        toast.info('🗑️ Error history cleared');
    };

    const handleClearRetryQueue = () => {
        setRetryQueue([]);
        toast.info('🗑️ Retry queue cleared');
    };

    // Cleanup function for when converted images are cleared
    const cleanupConvertedImages = () => {
        convertedImages.forEach(image => {
            if (image.url && image.url.startsWith('blob:')) {
                URL.revokeObjectURL(image.url);
            }
        });
        setConvertedImages([]);
        toast.info('🗑️ Converted images cleared');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Image to WebP Converter</h1>
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Upload Images</label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                            </svg>
                            <p className="text-gray-600 font-medium mb-1">Drag & drop images here</p>
                            <p className="text-sm text-gray-500">or click to browse files</p>
                            <p className="text-xs text-gray-400 mt-2">Supports: JPG, PNG, WEBP, GIF, etc.</p>
                        </div>
                    </div>
                </div>
                {images.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Selected Files ({images.length})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((file, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-2 shadow-sm border border-gray-200 flex flex-col h-full">
                                    {console.log('DEBUG: Rendering file preview for:', file.name, 'Preview URL:', file.preview, 'Type:', file.type, 'Preview Ready:', file.previewReady, 'File object:', file)}
                                    
                                    {file.type && file.type.startsWith('image/') && file.preview && file.previewReady && (
                                        <div className="w-full h-24 bg-white rounded-md overflow-hidden border border-gray-200 mb-2">
                                            <img
                                                src={file.preview}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.error('DEBUG: Image preview failed to load:', file.name, 'Preview URL:', file.preview);
                                                    console.error('DEBUG: Current object URLs state:', objectURLs);
                                                    console.error('DEBUG: Is preview URL in tracked URLs?', objectURLs.includes(file.preview));
                                                    e.target.style.display = 'none';
                                                }}
                                                onLoad={(e) => {
                                                    console.log('DEBUG: Image preview loaded successfully:', file.name, 'Preview URL:', file.preview);
                                                }}
                                            />
                                        </div>
                                    )}
                                    {!file.preview && file.type && file.type.startsWith('image/') && (
                                        <div className="w-full h-24 bg-red-50 rounded-md overflow-hidden border border-red-200 flex items-center justify-center mb-2">
                                            <span className="text-red-600 text-xs text-center p-2">Preview unavailable</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center mt-auto">
                                        <p className="text-xs text-gray-500 truncate">{file.size ? formatFileSize(file.size) : 'Unknown size'}</p>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                                            title="Remove file"
                                            aria-label="Remove file"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Optimization Preset</label>
                    <select
                        value={preset}
                        onChange={handlePresetChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="Custom">Custom (Manual Settings)</option>
                        <option value="Web">Web (Quality: 75, Resize: 1200px max)</option>
                        <option value="Print">Print (Quality: 95, No Resize)</option>
                        <option value="Social Media">Social Media (Quality: 85, Resize: 1600px max)</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Resize Width (px)</label>
                        <input
                            type="number"
                            value={resizeWidth}
                            onChange={(e) => setResizeWidth(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Images will only be downscaled if larger than this width. Smaller images will not be upscaled."
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Quality (1-100)</label>
                        <input
                            type="number"
                            value={quality}
                            min="1"
                            max="100"
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={handleConvert}
                        disabled={isConverting || images.length === 0}
                        className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            (isConverting || images.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isConverting ? 'Converting...' : 'Convert to WebP'}
                    </button>
                    
                    {retryQueue.length > 0 && (
                        <button
                            onClick={handleRetryConversion}
                            disabled={isConverting}
                            className={`flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                isConverting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isConverting ? 'Retrying...' : `Retry (${retryQueue.length})`}
                        </button>
                    )}
                </div>
                {errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-medium text-red-800">Error History ({errors.length})</h3>
                            <button
                                onClick={handleClearErrors}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {errors.map((error, index) => (
                                <div key={index} className="p-2 bg-red-100 rounded text-sm text-red-800">
                                    <strong>{error.fileName || 'System'}: </strong>{error.message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {retryQueue.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-medium text-yellow-800">Retry Queue ({retryQueue.length})</h3>
                            <button
                                onClick={handleClearRetryQueue}
                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                            >
                                Clear Queue
                            </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {retryQueue.map((file, index) => (
                                <div key={index} className="p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                                    <strong>{index + 1}. </strong>{file.name} ({formatFileSize(file.size)})
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {convertedImages.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-medium text-green-800">Converted Images ({convertedImages.length})</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={cleanupConvertedImages}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={testMemoryCleanup}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Test Cleanup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {convertedImages.map((image, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                            {image.preview && image.previewReady ? (
                                <img
                                    src={image.preview}
                                    alt={`Converted ${index}`}
                                    className="w-full h-32 object-cover rounded-md mb-2"
                                    onError={(e) => {
                                        console.error('Converted image preview failed to load:', image.name, 'Preview URL:', image.preview);
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                        console.log('Converted image preview loaded successfully:', image.name);
                                    }}
                                />
                            ) : (
                                <div className="w-full h-32 bg-red-50 rounded-md overflow-hidden border border-red-200 flex items-center justify-center mb-2">
                                    <span className="text-red-600 text-xs text-center p-2">Preview unavailable</span>
                                </div>
                            )}
                            <button
                                onClick={() => handleDownload(image.name)}
                                className="w-full bg-green-600 text-white py-1 px-2 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Download
                            </button>
                            <button
                                onClick={() => {
                                    setShowComparison(true);
                                    setComparisonIndex(index);
                                }}
                                className="w-full bg-blue-600 text-white py-1 px-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
                            >
                                Compare
                            </button>
                        </div>
                    ))}
                </div>

                {showComparison && comparisonIndex < convertedImages.length && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Image Comparison</h2>
                                    <button
                                        onClick={() => {
                                            // Cleanup will be handled by the general cleanup mechanism
                                            setShowComparison(false);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="text-center">
                                        <h3 className="font-medium text-gray-700 mb-2">Original Image</h3>
                                        <div className="bg-gray-100 rounded-lg p-4 mb-3">
                                            <img
                                                src={images[comparisonIndex]?.preview}
                                                alt="Original"
                                                className="w-full max-h-64 object-contain rounded-md"
                                            />
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p><strong>Name:</strong> {images[comparisonIndex].name}</p>
                                            <p><strong>Size:</strong> {formatFileSize(images[comparisonIndex].size)}</p>
                                            <p><strong>Type:</strong> {images[comparisonIndex].type}</p>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="font-medium text-gray-700 mb-2">Converted WebP</h3>
                                        <div className="bg-gray-100 rounded-lg p-4 mb-3">
                                            {convertedImages[comparisonIndex]?.preview && convertedImages[comparisonIndex]?.previewReady ? (
                                                <img
                                                    src={convertedImages[comparisonIndex].preview}
                                                    alt="Converted"
                                                    className="w-full max-h-64 object-contain rounded-md"
                                                    onError={(e) => {
                                                        console.error('Converted image preview failed to load in comparison:', convertedImages[comparisonIndex].name, 'Preview URL:', convertedImages[comparisonIndex].preview);
                                                        e.target.style.display = 'none';
                                                    }}
                                                    onLoad={(e) => {
                                                        console.log('Converted image preview loaded successfully in comparison:', convertedImages[comparisonIndex].name);
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-64 bg-red-50 rounded-md overflow-hidden border border-red-200 flex items-center justify-center">
                                                    <span className="text-red-600 text-sm text-center p-2">Converted image preview unavailable</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p><strong>Name:</strong> {convertedImages[comparisonIndex].name}</p>
                                            <p><strong>Size:</strong> {formatFileSize(convertedImages[comparisonIndex].size)}</p>
                                            <p><strong>Type:</strong> image/webp</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Comparison Metrics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 mb-1">
                                                {calculateSizeSavings(
                                                    images[comparisonIndex].size,
                                                    convertedImages[comparisonIndex].size
                                                )}%
                                            </div>
                                            <div className="text-sm text-gray-600">File Size Reduction</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                                {formatFileSize(Math.max(0, images[comparisonIndex].size - (convertedImages[comparisonIndex].size || 0)))}
                                            </div>
                                            <div className="text-sm text-gray-600">Bytes Saved</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600 mb-1">
                                                {convertedImages[comparisonIndex].size && images[comparisonIndex].size
                                                    ? ((convertedImages[comparisonIndex].size / images[comparisonIndex].size) * 100).toFixed(1)
                                                    : '0.0'}%
                                            </div>
                                            <div className="text-sm text-gray-600">Compression Ratio</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            if (comparisonIndex > 0) {
                                                setComparisonIndex(comparisonIndex - 1);
                                            }
                                        }}
                                        disabled={comparisonIndex === 0}
                                        className={`px-4 py-2 rounded-md ${comparisonIndex === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (comparisonIndex < convertedImages.length - 1) {
                                                setComparisonIndex(comparisonIndex + 1);
                                            }
                                        }}
                                        disabled={comparisonIndex === convertedImages.length - 1}
                                        className={`px-4 py-2 rounded-md ${comparisonIndex === convertedImages.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;