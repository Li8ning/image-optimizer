import React from 'react';
import { toast } from 'react-toastify';

const BatchOperations = ({ 
    convertedImages, 
    onDownloadAll, 
    onSelectAll, 
    onDeselectAll, 
    selectedImages = [],
    onBulkDownload
}) => {
    
    const handleDownloadAll = () => {
        if (convertedImages.length === 0) {
            toast.warning('⚠️ No converted images available for download');
            return;
        }
        onDownloadAll();
    };
    
    const handleSelectAll = () => {
        if (convertedImages.length === 0) {
            toast.warning('⚠️ No images to select');
            return;
        }
        onSelectAll();
        toast.info(`✅ Selected all ${convertedImages.length} images`);
    };
    
    const handleDeselectAll = () => {
        if (selectedImages.length === 0) {
            toast.warning('⚠️ No images currently selected');
            return;
        }
        onDeselectAll();
        toast.info('✅ Deselected all images');
    };
    
    const handleBulkDownload = () => {
        if (selectedImages.length === 0) {
            toast.warning('⚠️ Please select images first');
            return;
        }
        onBulkDownload();
    };
    
    return (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg" role="region" aria-label="Batch operations">
            <h3 className="text-lg font-medium text-purple-800 mb-3" id="batch-operations-title">Batch Operations</h3>
            <div className="flex flex-wrap gap-2" role="toolbar" aria-labelledby="batch-operations-title">
                <button
                    onClick={handleDownloadAll}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (convertedImages.length > 0) {
                                handleDownloadAll();
                            }
                        }
                    }}
                    disabled={convertedImages.length === 0}
                    className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm ${
                        convertedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Download all converted images as ZIP"
                    aria-label="Download all converted images as ZIP"
                    aria-disabled={convertedImages.length === 0}
                    tabIndex={convertedImages.length === 0 ? -1 : 0}
                >
                    Download All (ZIP)
                </button>
                
                <button
                    onClick={handleSelectAll}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (convertedImages.length > 0) {
                                handleSelectAll();
                            }
                        }
                    }}
                    disabled={convertedImages.length === 0}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm ${
                        convertedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Select all converted images"
                    aria-label="Select all converted images"
                    aria-disabled={convertedImages.length === 0}
                    tabIndex={convertedImages.length === 0 ? -1 : 0}
                >
                    Select All
                </button>
                
                <button
                    onClick={handleDeselectAll}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (selectedImages.length > 0) {
                                handleDeselectAll();
                            }
                        }
                    }}
                    disabled={selectedImages.length === 0}
                    className={`px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm ${
                        selectedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Deselect all images"
                    aria-label="Deselect all images"
                    aria-disabled={selectedImages.length === 0}
                    tabIndex={selectedImages.length === 0 ? -1 : 0}
                >
                    Deselect All
                </button>
                
                <button
                    onClick={handleBulkDownload}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (selectedImages.length > 0) {
                                handleBulkDownload();
                            }
                        }
                    }}
                    disabled={selectedImages.length === 0}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm ${
                        selectedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={`Download ${selectedImages.length} selected images as ZIP`}
                    aria-label={`Download ${selectedImages.length} selected images as ZIP`}
                    aria-disabled={selectedImages.length === 0}
                    tabIndex={selectedImages.length === 0 ? -1 : 0}
                >
                    Download Selected ({selectedImages.length})
                </button>
            </div>
            
            {selectedImages.length > 0 && (
                <div className="mt-2 text-sm text-purple-600">
                    Selected: {selectedImages.length} of {convertedImages.length} images
                </div>
            )}
        </div>
    );
};

export default BatchOperations;