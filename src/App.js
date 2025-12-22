import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import ImageUpload from './components/ImageUpload.js';
import ImagePreview from './components/ImagePreview.js';
import SettingsPanel from './components/SettingsPanel.js';
import ErrorDisplay from './components/ErrorDisplay.js';
import ConvertedImage from './components/ConvertedImage.js';
import ComparisonModal from './components/ComparisonModal.js';

// Import services
import ApiService from './services/apiService.js';

// Import utilities
import {
    validateFiles,
    formatFileSize,
    calculateSizeSavings,
    cleanupObjectURLs,
    createFileWithPreview,
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES
} from './utils/fileUtils.js';

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

    // Preset configurations
    const presets = {
        'Custom': { quality: 80, resizeWidth: 0 },
        'Web': { quality: 75, resizeWidth: 1200 },
        'Print': { quality: 95, resizeWidth: 0 },
        'Social Media': { quality: 85, resizeWidth: 1600 }
    };

    const handleFilesUploaded = (files) => {
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
                    const { fileWithPreview, previewUrl } = createFileWithPreview(file);

                    filesWithPreviews.push(fileWithPreview);
                    if (previewUrl) {
                        newObjectURLs.push(previewUrl);
                    }

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

    const handlePresetChange = (selectedPreset) => {
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

        try {
            const data = await ApiService.convertImages(images, resizeWidth, quality);

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
                            const blob = await ApiService.fetchConvertedImage(image.url);

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

            setErrors(prevErrors => [...prevErrors, {
                errorType: 'network_error',
                message: error.message,
                originalError: error.message
            }]);

            toast.error(`❌ ${error.message}`);

            // Add all files to retry queue on network error
            setRetryQueue(images);
            toast.info(`ℹ️ All files added to retry queue due to network error`);

        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = (filename) => {
        ApiService.downloadConvertedImage(filename);
    };

    const handleRetryConversion = async () => {
        if (retryQueue.length === 0) {
            toast.warning('⚠️ No files in retry queue');
            return;
        }

        setIsConverting(true);

        try {
            const data = await ApiService.convertImages(retryQueue, resizeWidth, quality);

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
                            const blob = await ApiService.fetchConvertedImage(image.url);

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

            setErrors(prevErrors => [...prevErrors, {
                errorType: 'retry_network_error',
                message: error.message,
                originalError: error.message
            }]);

            toast.error(`❌ ${error.message}`);

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

    const testMemoryCleanup = () => {
        ApiService.testMemoryCleanup();
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

                <ImageUpload
                    onFilesUploaded={handleFilesUploaded}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                />

                {images.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Selected Files ({images.length})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((file, index) => (
                                <ImagePreview
                                    key={index}
                                    file={file}
                                    index={index}
                                    onRemove={handleRemoveFile}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <SettingsPanel
                    preset={preset}
                    quality={quality}
                    resizeWidth={resizeWidth}
                    onPresetChange={handlePresetChange}
                    onQualityChange={setQuality}
                    onResizeWidthChange={setResizeWidth}
                />

                <div className="flex gap-4 mb-4">
                    <button
                        onClick={handleConvert}
                        disabled={isConverting || images.length === 0}
                        className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {
                            (isConverting || images.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isConverting ? 'Converting...' : 'Convert to WebP'}
                    </button>

                    {retryQueue.length > 0 && (
                        <button
                            onClick={handleRetryConversion}
                            disabled={isConverting}
                            className={`flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 {
                                isConverting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isConverting ? 'Retrying...' : `Retry (${retryQueue.length})`}
                        </button>
                    )}
                </div>

                <ErrorDisplay
                    errors={errors}
                    onClearErrors={handleClearErrors}
                />

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
                        <ConvertedImage
                            key={index}
                            image={image}
                            onDownload={handleDownload}
                            onCompare={() => {
                                setShowComparison(true);
                                setComparisonIndex(index);
                            }}
                        />
                    ))}
                </div>

                <ComparisonModal
                    show={showComparison && comparisonIndex < convertedImages.length}
                    originalImage={images[comparisonIndex]}
                    convertedImage={convertedImages[comparisonIndex]}
                    onClose={() => setShowComparison(false)}
                    onPrevious={() => {
                        if (comparisonIndex > 0) {
                            setComparisonIndex(comparisonIndex - 1);
                        }
                    }}
                    onNext={() => {
                        if (comparisonIndex < convertedImages.length - 1) {
                            setComparisonIndex(comparisonIndex + 1);
                        }
                    }}
                    hasPrevious={comparisonIndex > 0}
                    hasNext={comparisonIndex < convertedImages.length - 1}
                />
            </div>
        </div>
    );
}

export default App;