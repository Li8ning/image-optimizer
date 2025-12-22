import React from 'react';

const ConvertedImage = ({ image, onDownload, onCompare }) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            {image.preview && image.previewReady ? (
                <img
                    src={image.preview}
                    alt={`Converted ${image.name}`}
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
                onClick={() => onDownload(image.name)}
                className="w-full bg-green-600 text-white py-1 px-2 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
                Download
            </button>
            <button
                onClick={() => onCompare(image)}
                className="w-full bg-blue-600 text-white py-1 px-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
            >
                Compare
            </button>
        </div>
    );
};

export default ConvertedImage;