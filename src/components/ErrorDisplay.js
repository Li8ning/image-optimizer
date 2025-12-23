import React from 'react';

const ErrorDisplay = ({ errors, onClearErrors }) => {
    if (errors.length === 0) return null;

    return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-red-800">Error History ({errors.length})</h3>
                <button
                    onClick={onClearErrors}
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
    );
};

export default ErrorDisplay;