import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom Virtualized Grid Component (replaces react-window)
const VirtualizedGrid = ({
    items,
    renderItem,
    columnCount = 4,
    itemHeight = 150,
    containerHeight = 400,
    gap = 8
}) => {
    const containerRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
    
    // Calculate visible items based on scroll position
    const calculateVisibleRange = useCallback(() => {
        if (!containerRef.current) return { start: 0, end: Math.min(items.length - 1, columnCount * 4) };
        
        const scrollTop = containerRef.current.scrollTop;
        const startIndex = Math.floor(scrollTop / (itemHeight + gap)) * columnCount;
        const endIndex = Math.min(
            startIndex + columnCount * 6, // Render a few extra rows for smooth scrolling
            items.length - 1
        );
        
        return { start: Math.max(0, startIndex), end: endIndex };
    }, [items.length, columnCount, itemHeight, gap]);
    
    // Update visible range on scroll and resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const handleScroll = () => {
            setVisibleRange(calculateVisibleRange());
        };
        
        container.addEventListener('scroll', handleScroll);
        
        // Initial calculation
        setVisibleRange(calculateVisibleRange());
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [calculateVisibleRange]);
    
    // Calculate container style
    const totalHeight = Math.ceil(items.length / columnCount) * (itemHeight + gap);
    
    return (
        <div
            ref={containerRef}
            className="virtualized-grid-container overflow-auto"
            style={{
                height: `${containerHeight}px`,
                width: '100%',
                position: 'relative'
            }}
        >
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                {items.length > 0 && (
                    <div
                        className="grid grid-cols-4 gap-4 p-2"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${visibleRange.start * (itemHeight + gap) / columnCount}px)`
                        }}
                    >
                        {items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => {
                            const absoluteIndex = visibleRange.start + index;
                            return (
                                <div key={absoluteIndex} className="p-2" style={{ height: `${itemHeight}px` }}>
                                    {renderItem({ item, index: absoluteIndex })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// Import components
import ImageUpload from './components/ImageUpload.js';
import ImagePreview from './components/ImagePreview.js';
import SettingsPanel from './components/SettingsPanel.js';
import ErrorDisplay from './components/ErrorDisplay.js';
import ConvertedImage from './components/ConvertedImage.js';
import ComparisonModal from './components/ComparisonModal.js';
import BatchOperations from './components/BatchOperations.js';

// Import services
import ApiService from './services/apiService.js';
import ZipService from './services/zipService.js';

// Import utilities
import {
    validateFiles,
    formatFileSize,
    cleanupObjectURLs,
    createFileWithPreview
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
    const [selectedImages, setSelectedImages] = useState([]);
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const _isDownloadingZip = isDownloadingZip; // Used for tracking download state
    
    // Performance: Debounced state updates for input fields
    const [debouncedResizeWidth, setDebouncedResizeWidth] = useState(0);
    const [debouncedQuality, setDebouncedQuality] = useState(80);
    
    // Performance: Performance metrics tracking
    const [performanceMetrics, setPerformanceMetrics] = useState({
        fileUploadTime: 0,
        conversionTime: 0,
        previewGenerationTime: 0,
        totalProcessingTime: 0
    });

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

    // Performance: Debounce quality input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuality(quality);
        }, 500);

        return () => clearTimeout(timer);
    }, [quality]);

    // Performance: Debounce resize width input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedResizeWidth(resizeWidth);
        }, 500);

        return () => clearTimeout(timer);
    }, [resizeWidth]);

    // Preset configurations
    const presets = {
        'Custom': { quality: 80, resizeWidth: 0 },
        'Web': { quality: 75, resizeWidth: 1200 },
        'Print': { quality: 95, resizeWidth: 0 },
        'Social Media': { quality: 85, resizeWidth: 1600 },
        'Mobile': { quality: 70, resizeWidth: 800 },
        'Thumbnail': { quality: 60, resizeWidth: 300 }
    };

    const handleFilesUploaded = (files) => {
        console.log('DEBUG: Files selected:', files.length, files.map(f => ({name: f.name, type: f.type, size: f.size, lastModified: f.lastModified})));
        
        // Performance: Start file upload timing
        const fileUploadStart = performance.now();
    
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
                
                // Check for undefined or null values
                const hasInvalidValues = updatedImages.some(img => img === undefined || img === null);
                if (hasInvalidValues) {
                    console.error('DEBUG: Found undefined or null values in images array');
                    console.error('DEBUG: Invalid images:', updatedImages.filter(img => img === undefined || img === null));
                }
                
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
    
            // Performance: End file upload timing and update metrics
            const fileUploadEnd = performance.now();
            const fileUploadDuration = fileUploadEnd - fileUploadStart;
            
            setPerformanceMetrics(prev => ({
                ...prev,
                fileUploadTime: fileUploadDuration,
                totalProcessingTime: prev.totalProcessingTime + fileUploadDuration
            }));
            
            console.log(`PERFORMANCE: File upload processed in ${fileUploadDuration.toFixed(2)}ms`);
    
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
        setResizeWidth(presetSettings.quality);
        setDebouncedQuality(presetSettings.quality);
        setDebouncedResizeWidth(presetSettings.resizeWidth);
    };
    
    // Performance: Debounced handlers for input fields
    const handleQualityChange = (value) => {
        setQuality(value);
    };
    
    const handleResizeWidthChange = (value) => {
        setResizeWidth(value);
    };

    const handleConvert = async () => {
        if (images.length === 0) {
            toast.warning('⚠️ Please upload at least one image to convert');
            return;
        }
    
        // Validate settings using debounced values
        if (debouncedQuality < 1 || debouncedQuality > 100) {
            toast.error('❌ Quality must be between 1 and 100');
            return;
        }
    
        if (debouncedResizeWidth < 0 || debouncedResizeWidth > 10000) {
            toast.error('❌ Resize width must be between 0 and 10000 pixels');
            return;
        }
    
        setIsConverting(true);
        setErrors([]);
    
        try {
            // Performance: Start conversion timing
            const conversionStart = performance.now();
            
            const data = await ApiService.convertImages(images, debouncedResizeWidth, debouncedQuality);
    
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
                // Performance: Start preview generation timing
                const previewGenerationStart = performance.now();
                
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
                    
                    // Performance: End preview generation timing
                    const previewGenerationEnd = performance.now();
                    const previewGenerationDuration = previewGenerationEnd - previewGenerationStart;
                    
                    // Performance: End conversion timing
                    const conversionEnd = performance.now();
                    const conversionDuration = conversionEnd - conversionStart;
                    
                    setPerformanceMetrics(prev => ({
                        ...prev,
                        conversionTime: conversionDuration,
                        previewGenerationTime: previewGenerationDuration,
                        totalProcessingTime: prev.totalProcessingTime + conversionDuration + previewGenerationDuration
                    }));
                    
                    console.log(`PERFORMANCE: Image conversion completed in ${conversionDuration.toFixed(2)}ms`);
                    console.log(`PERFORMANCE: Preview generation completed in ${previewGenerationDuration.toFixed(2)}ms`);
    
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
        setSelectedImages([]);
        toast.info('🗑️ Converted images cleared');
    };

    const testMemoryCleanup = () => {
        ApiService.testMemoryCleanup();
    };

    // Batch Operations: Download all converted images as ZIP
    const handleDownloadAllAsZip = async () => {
        if (convertedImages.length === 0) {
            toast.warning('⚠️ No converted images available for download');
            return;
        }

        try {
            setIsDownloadingZip(true);
            toast.info('📦 Preparing ZIP download...');

            const result = await ZipService.createAndDownloadZip(convertedImages, 'all_converted_images');

            if (result.success) {
                toast.success(`✅ Successfully downloaded ${result.successfulImages} of ${result.totalImages} images as ZIP`);
                
                if (result.failedImages.length > 0) {
                    toast.warning(`⚠️ ${result.failedImages.length} images failed to download`);
                    console.error('Failed to download images:', result.failedImages);
                }
            } else {
                toast.error('❌ Failed to create ZIP file');
            }

        } catch (error) {
            console.error('Error downloading ZIP:', error);
            toast.error(`❌ Failed to download ZIP: ${error.message}`);
        } finally {
            setIsDownloadingZip(false);
        }
    };

    // Batch Operations: Select all images
    const handleSelectAllImages = () => {
        const allImageNames = convertedImages.map(image => image.name);
        setSelectedImages(allImageNames);
    };

    // Batch Operations: Deselect all images
    const handleDeselectAllImages = () => {
        setSelectedImages([]);
    };

    // Batch Operations: Toggle individual image selection
    const handleToggleImageSelection = (imageName) => {
        setSelectedImages(prevSelected => {
            if (prevSelected.includes(imageName)) {
                return prevSelected.filter(name => name !== imageName);
            } else {
                return [...prevSelected, imageName];
            }
        });
    };

    // Batch Operations: Download selected images as ZIP
    const handleDownloadSelectedAsZip = async () => {
        if (selectedImages.length === 0) {
            toast.warning('⚠️ Please select images first');
            return;
        }

        try {
            setIsDownloadingZip(true);
            toast.info('📦 Preparing selected images ZIP download...');

            // Filter converted images to only include selected ones
            const selectedConvertedImages = convertedImages.filter(image =>
                selectedImages.includes(image.name)
            );

            const result = await ZipService.createAndDownloadZip(selectedConvertedImages, 'selected_images');

            if (result.success) {
                toast.success(`✅ Successfully downloaded ${result.successfulImages} of ${result.totalImages} selected images as ZIP`);
                
                if (result.failedImages.length > 0) {
                    toast.warning(`⚠️ ${result.failedImages.length} images failed to download`);
                    console.error('Failed to download selected images:', result.failedImages);
                }
            } else {
                toast.error('❌ Failed to create ZIP file for selected images');
            }

        } catch (error) {
            console.error('Error downloading selected images ZIP:', error);
            toast.error(`❌ Failed to download selected images ZIP: ${error.message}`);
        } finally {
            setIsDownloadingZip(false);
        }
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
                
                {/* Performance: Performance metrics display */}
                {performanceMetrics.totalProcessingTime > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="font-medium">File Upload:</span>
                                <span> {performanceMetrics.fileUploadTime.toFixed(2)}ms</span>
                            </div>
                            <div>
                                <span className="font-medium">Conversion:</span>
                                <span> {performanceMetrics.conversionTime.toFixed(2)}ms</span>
                            </div>
                            <div>
                                <span className="font-medium">Preview Gen:</span>
                                <span> {performanceMetrics.previewGenerationTime.toFixed(2)}ms</span>
                            </div>
                            <div>
                                <span className="font-medium">Total:</span>
                                <span> {performanceMetrics.totalProcessingTime.toFixed(2)}ms</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <ImageUpload
                    onFilesUploaded={handleFilesUploaded}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                />

                {images.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Selected Files ({images.length})</h3>
                        {images && images.length > 0 && (
                            images.length > 20 ? (
                                <div className="virtualized-grid" style={{ height: '400px', width: '100%' }}>
                                    <VirtualizedGrid
                                        items={images}
                                        columnCount={4}
                                        itemHeight={150}
                                        containerHeight={400}
                                        renderItem={({ item, index }) => (
                                            <ImagePreview
                                                file={item}
                                                index={index}
                                                onRemove={handleRemoveFile}
                                            />
                                        )}
                                    />
                                </div>
                            ) : (
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
                            )
                        )}
                    </div>
                )}

                <SettingsPanel
                    preset={preset}
                    quality={debouncedQuality}
                    resizeWidth={debouncedResizeWidth}
                    onPresetChange={handlePresetChange}
                    onQualityChange={handleQualityChange}
                    onResizeWidthChange={handleResizeWidthChange}
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

                {convertedImages.length > 0 && (
                    <BatchOperations
                        convertedImages={convertedImages}
                        onDownloadAll={handleDownloadAllAsZip}
                        onSelectAll={handleSelectAllImages}
                        onDeselectAll={handleDeselectAllImages}
                        selectedImages={selectedImages}
                        onBulkDownload={handleDownloadSelectedAsZip}
                    />
                )}

                <div className="mt-6">
                    {convertedImages && convertedImages.length > 0 && (
                        convertedImages.length > 20 ? (
                            <div className="virtualized-grid" style={{ height: '400px', width: '100%' }}>
                                <VirtualizedGrid
                                    items={convertedImages}
                                    columnCount={4}
                                    itemHeight={200}
                                    containerHeight={400}
                                    renderItem={({ item, index }) => (
                                        <ConvertedImage
                                            image={item}
                                            onDownload={handleDownload}
                                            onCompare={() => {
                                                setShowComparison(true);
                                                setComparisonIndex(index);
                                            }}
                                            onSelect={handleToggleImageSelection}
                                            isSelected={selectedImages.includes(item.name)}
                                        />
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {convertedImages.map((image, index) => (
                                    <ConvertedImage
                                        key={index}
                                        image={image}
                                        onDownload={handleDownload}
                                        onCompare={() => {
                                            setShowComparison(true);
                                            setComparisonIndex(index);
                                        }}
                                        onSelect={handleToggleImageSelection}
                                        isSelected={selectedImages.includes(image.name)}
                                    />
                                ))}
                            </div>
                        )
                    )}
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