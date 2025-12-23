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
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800 mb-3">Batch Operations</h3>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={handleDownloadAll}
                    disabled={convertedImages.length === 0}
                    className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm ${
                        convertedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Download all converted images as ZIP"
                >
                    Download All (ZIP)
                </button>
                
                <button
                    onClick={handleSelectAll}
                    disabled={convertedImages.length === 0}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm ${
                        convertedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Select all converted images"
                >
                    Select All
                </button>
                
                <button
                    onClick={handleDeselectAll}
                    disabled={selectedImages.length === 0}
                    className={`px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm ${
                        selectedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Deselect all images"
                >
                    Deselect All
                </button>
                
                <button
                    onClick={handleBulkDownload}
                    disabled={selectedImages.length === 0}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm ${
                        selectedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={`Download ${selectedImages.length} selected images as ZIP`}
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