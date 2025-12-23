import React from 'react';

const ImageUpload = ({ onFilesUploaded, setIsDragging }) => {
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
        onFilesUploaded(files);
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        onFilesUploaded(files);
    };

    return (
        <div className="mb-6">
            <label htmlFor="fileInput" className="block text-gray-700 font-medium mb-2">Upload Images</label>
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all {
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
                role="button"
                tabIndex="0"
                aria-label="Drag and drop images here or click to browse files"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('fileInput').click();
                    }
                }}
            >
                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Select images to upload"
                    aria-describedby="file-input-description"
                />
                <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                    </svg>
                    <p className="text-gray-600 font-medium mb-1">Drag & drop images here</p>
                    <p className="text-sm text-gray-500">or click to browse files</p>
                    <p id="file-input-description" className="text-xs text-gray-400 mt-2">Supports: JPG, PNG, WEBP, GIF, etc.</p>
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;
