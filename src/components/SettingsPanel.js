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
        <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Optimization Preset</label>
            <select
                value={preset}
                onChange={handlePresetChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                    <label className="block text-gray-700 font-medium mb-2">Resize Width (px)</label>
                    <input
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => onResizeWidthChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Images will only be downscaled if larger than this width. Smaller images will not be upscaled."
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Quality (1-100)</label>
                    <input
                        type="number"
                        value={quality}
                        min="1"
                        max="100"
                        onChange={(e) => onQualityChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;