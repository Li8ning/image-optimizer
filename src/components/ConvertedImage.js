import React from 'react';

const ConvertedImage = ({ image, onDownload, onCompare, onSelect, isSelected = false }) => {

    return (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm relative" role="article" aria-label={`Converted image: ${image.name}`}>
            {/* Selection checkbox */}
            <div className="absolute top-2 right-2 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(image.name)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(image.name);
                        }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    title={isSelected ? 'Deselect image' : 'Select image'}
                    aria-label={isSelected ? `Deselect ${image.name}` : `Select ${image.name}`}
                    tabIndex={0}
                />
            </div>
            
            {image.preview && image.previewReady ? (
                <img
                    src={image.preview}
                    alt={`Converted WebP version of ${image.name}`}
                    className="w-full h-32 object-cover rounded-md mb-2"
                    loading="lazy"
                    onError={() => {
                        console.error('Converted image preview failed to load:', image.name, 'Preview URL:', image.preview);
                        event.target.style.display = 'none';
                    }}
                    onLoad={() => {
                        console.log('Converted image preview loaded successfully:', image.name);
                    }}
                />
            ) : (
                <div className="w-full h-32 bg-red-50 rounded-md overflow-hidden border border-red-200 flex items-center justify-center mb-2" role="alert" aria-live="polite">
                    <span className="text-red-600 text-xs text-center p-2">Preview unavailable</span>
                </div>
            )}
            <button
                onClick={() => onDownload(image.name)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onDownload(image.name);
                    }
                }}
                className="w-full bg-green-600 text-white py-1 px-2 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label={`Download converted image ${image.name}`}
                tabIndex={0}
            >
                Download
            </button>
            <button
                onClick={() => onCompare(image)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCompare(image);
                    }
                }}
                className="w-full bg-blue-600 text-white py-1 px-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
                aria-label={`Compare original and converted versions of ${image.name}`}
                tabIndex={0}
            >
                Compare
            </button>
        </div>
    );
};

export default ConvertedImage;