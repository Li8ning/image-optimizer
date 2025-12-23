import React from 'react';

const ComparisonModal = ({ show, originalImage, convertedImage, onClose, onPrevious, onNext, hasPrevious, hasNext }) => {
    if (!show) return null;

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Image Comparison</h2>
                        <button
                            onClick={onClose}
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
                                    src={originalImage?.preview}
                                    alt="Original"
                                    className="w-full max-h-64 object-contain rounded-md"
                                />
                            </div>
                            <div className="text-sm text-gray-600">
                                <p><strong>Name:</strong> {originalImage.name}</p>
                                <p><strong>Size:</strong> {formatFileSize(originalImage.size)}</p>
                                <p><strong>Type:</strong> {originalImage.type}</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="font-medium text-gray-700 mb-2">Converted WebP</h3>
                            <div className="bg-gray-100 rounded-lg p-4 mb-3">
                                {convertedImage?.preview && convertedImage?.previewReady ? (
                                    <img
                                        src={convertedImage.preview}
                                        alt="Converted"
                                        className="w-full max-h-64 object-contain rounded-md"
                                        onError={() => {
                                            console.error('Converted image preview failed to load in comparison:', convertedImage.name, 'Preview URL:', convertedImage.preview);
                                            event.target.style.display = 'none';
                                        }}
                                        onLoad={() => {
                                            console.log('Converted image preview loaded successfully in comparison:', convertedImage.name);
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-red-50 rounded-md overflow-hidden border border-red-200 flex items-center justify-center">
                                        <span className="text-red-600 text-sm text-center p-2">Converted image preview unavailable</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                <p><strong>Name:</strong> {convertedImage.name}</p>
                                <p><strong>Size:</strong> {formatFileSize(convertedImage.size)}</p>
                                <p><strong>Type:</strong> image/webp</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Comparison Metrics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                    {calculateSizeSavings(originalImage.size, convertedImage.size)}%
                                </div>
                                <div className="text-sm text-gray-600">File Size Reduction</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                    {formatFileSize(Math.max(0, originalImage.size - (convertedImage.size || 0)))}
                                </div>
                                <div className="text-sm text-gray-600">Bytes Saved</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-1">
                                    {convertedImage.size && originalImage.size
                                        ? ((convertedImage.size / originalImage.size) * 100).toFixed(1)
                                        : '0.0'}%
                                </div>
                                <div className="text-sm text-gray-600">Compression Ratio</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            className={`px-4 py-2 rounded-md ${!hasPrevious ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className={`px-4 py-2 rounded-md ${!hasNext ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;