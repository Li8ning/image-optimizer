import React from 'react';

const SettingsPanel = ({ preset, quality, resizeWidth, onPresetChange, onQualityChange, onResizeWidthChange }) => {
    const presets = {
        'Custom': { quality: 80, resizeWidth: 0 },
        'Web': { quality: 75, resizeWidth: 1200 },
        'Print': { quality: 95, resizeWidth: 0 },
        'Social Media': { quality: 85, resizeWidth: 1600 },
        'Mobile': { quality: 70, resizeWidth: 800 },
        'Thumbnail': { quality: 60, resizeWidth: 300 }
    };

    const handlePresetChange = (e) => {
        const selectedPreset = e.target.value;
        onPresetChange(selectedPreset);
        
        // Apply preset settings
        const presetSettings = presets[selectedPreset];
        onQualityChange(presetSettings.quality);
        onResizeWidthChange(presetSettings.resizeWidth);
    };

    return (
        <div className="mb-6" role="region" aria-label="Optimization settings">
            <label htmlFor="preset-select" className="block text-gray-700 font-medium mb-2">Optimization Preset</label>
            <select
                id="preset-select"
                value={preset}
                onChange={handlePresetChange}
                onKeyDown={(e) => {
                    // Allow keyboard navigation through options
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // The onChange handler will be triggered by the selection change
                    }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label="Select optimization preset"
                tabIndex={0}
            >
                <option value="Custom">Custom (Manual Settings)</option>
                <option value="Web">Web (Quality: 75, Resize: 1200px max)</option>
                <option value="Print">Print (Quality: 95, No Resize)</option>
                <option value="Social Media">Social Media (Quality: 85, Resize: 1600px max)</option>
                <option value="Mobile">Mobile (Quality: 70, Resize: 800px max)</option>
                <option value="Thumbnail">Thumbnail (Quality: 60, Resize: 300px max)</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label htmlFor="resize-width" className="block text-gray-700 font-medium mb-2">Resize Width (px)</label>
                    <input
                        id="resize-width"
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => onResizeWidthChange(e.target.value)}
                        onKeyDown={(e) => {
                            // Allow keyboard input for number fields
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                // Trigger any validation or update logic
                            }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Images will only be downscaled if larger than this width. Smaller images will not be upscaled."
                        aria-label="Resize width in pixels"
                        aria-describedby="resize-width-description"
                        tabIndex={0}
                    />
                    <p id="resize-width-description" className="text-xs text-gray-500 mt-1">Set to 0 to maintain original width</p>
                </div>
                <div>
                    <label htmlFor="quality" className="block text-gray-700 font-medium mb-2">Quality (1-100)</label>
                    <input
                        id="quality"
                        type="number"
                        value={quality}
                        min="1"
                        max="100"
                        onChange={(e) => onQualityChange(e.target.value)}
                        onKeyDown={(e) => {
                            // Allow keyboard input for number fields
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                // Trigger any validation or update logic
                            }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Image quality percentage"
                        tabIndex={0}
                    />
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;