import React from 'react';

const ImagePreview = ({ file, index, onRemove }) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-gray-50 rounded-lg p-2 shadow-sm border border-gray-200 flex flex-col h-full">
            {file.type && file.type.startsWith('image/') && file.preview && file.previewReady && (
                <div className="w-full h-24 bg-white rounded-md overflow-hidden border border-gray-200 mb-2">
                    <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.error('Image preview failed to load:', file.name, 'Preview URL:', file.preview);
                            e.target.style.display = 'none';
                        }}
                        onLoad={(e) => {
                            console.log('Image preview loaded successfully:', file.name, 'Preview URL:', file.preview);
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
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                    title="Remove file"
                    aria-label="Remove file"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default ImagePreview;