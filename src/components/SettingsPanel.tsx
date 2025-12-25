import * as React from 'react';
import { useImageStore } from '../hooks/useImageStore';
import type { ImageFormat, ProcessOptions } from '../types/image';
import { cn } from '../lib/cn';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Select } from './ui/Select';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Settings, ChevronDown, ChevronUp, RotateCcw, Scissors } from 'lucide-react';

const formatOptions = [
  { value: 'webp', label: 'WebP' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'avif', label: 'AVIF' },
];

const presets = [
  { value: 'web', label: 'Web' },
  { value: 'photo', label: 'Photo' },
  { value: 'lossless', label: 'Lossless' },
];

const presetConfigs: Record<string, Partial<ProcessOptions>> = {
  web: { quality: 75, format: 'webp' },
  photo: { quality: 85, format: 'webp' },
  lossless: { quality: 100, format: 'png' },
};

const resizeModeOptions = [
  { value: 'fit', label: 'Fit within' },
  { value: 'crop', label: 'Crop to fill' },
];

interface SettingsPanelProps {
  className?: string;
  onSelectPreset?: (width: number, height: number) => void;
}

export function SettingsPanel({ className, onSelectPreset }: SettingsPanelProps) {
  const { globalSettings, updateGlobalSettings } = useImageStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState<Partial<ProcessOptions>>(globalSettings);

  React.useEffect(() => {
    setLocalSettings(globalSettings);
  }, [globalSettings]);

  const handleSettingChange = (key: keyof ProcessOptions, value: unknown) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateGlobalSettings({ [key]: value });
  };

  const handlePresetClick = (preset: string) => {
    const config = presetConfigs[preset];
    if (config) {
      const newSettings = { ...localSettings, ...config };
      setLocalSettings(newSettings);
      updateGlobalSettings(config);
    }
  };

  const handleReset = () => {
    const defaultSettings: ProcessOptions = {
      format: 'webp',
      quality: 80,
      maintainAspectRatio: true,
      scale: 100,
      resizeMode: 'fit',
    };
    setLocalSettings(defaultSettings);
    updateGlobalSettings(defaultSettings);
  };

  const handlePresetSelect = (width: number, height: number) => {
    handleSettingChange('width', width);
    handleSettingChange('height', height);
    onSelectPreset?.(width, height);
  };

  const isResizing = localSettings.width !== undefined || localSettings.height !== undefined;
  const isScaling = localSettings.scale !== undefined && localSettings.scale !== 100;

  const formatLabel = formatOptions.find((f) => f.value === localSettings.format)?.label || 'WebP';

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <CardTitle>Settings</CardTitle>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-slate-100 transition-colors"
          aria-label={isCollapsed ? 'Expand settings' : 'Collapse settings'}
        >
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-slate-500" />
          )}
        </button>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Presets */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    localSettings.format === presetConfigs[preset.value]?.format &&
                      localSettings.quality === presetConfigs[preset.value]?.quality
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <Select
            label="Output Format"
            options={formatOptions}
            value={localSettings.format || 'webp'}
            onChange={(value) => handleSettingChange('format', value as ImageFormat)}
          />

          {/* Quality Slider */}
          <Slider
            label="Quality"
            value={localSettings.quality || 80}
            onChange={(value) => handleSettingChange('quality', value)}
            min={0}
            max={100}
            step={5}
            helperText="Higher quality means larger file size"
          />

          {/* Scale Option */}
          <div className="space-y-3">
            <Toggle
              label="Scale Image"
              checked={isScaling}
              onChange={(checked) => {
                if (checked) {
                  handleSettingChange('scale', 80);
                } else {
                  handleSettingChange('scale', 100);
                }
              }}
              helperText="Resize by percentage"
            />
            {isScaling && (
              <div className="pl-4">
                <Slider
                  label="Scale Percentage"
                  value={localSettings.scale || 100}
                  onChange={(value) => handleSettingChange('scale', value)}
                  min={10}
                  max={100}
                  step={5}
                  helperText={`${localSettings.scale || 100}% of original size`}
                />
              </div>
            )}
          </div>

          {/* Resize Toggle */}
          <Toggle
            label="Resize Image"
            checked={isResizing}
            onChange={(checked) => {
              if (checked) {
                handleSettingChange('width', 1920);
                handleSettingChange('height', undefined);
              } else {
                handleSettingChange('width', undefined);
                handleSettingChange('height', undefined);
              }
            }}
            helperText="Scale to specific dimensions"
          />

          {/* Resize Options */}
          {isResizing && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <Input
                type="number"
                label="Width (px)"
                value={localSettings.width || ''}
                onChange={(e) => handleSettingChange('width', parseInt(e.target.value) || undefined)}
                placeholder="1920"
                min={1}
              />
              <Input
                type="number"
                label="Height (px)"
                value={localSettings.height || ''}
                onChange={(e) => handleSettingChange('height', parseInt(e.target.value) || undefined)}
                placeholder="Auto"
                min={1}
              />

              {/* Resize Mode */}
              <div className="col-span-2">
                <Select
                  label="Resize Mode"
                  options={resizeModeOptions}
                  value={localSettings.resizeMode || 'fit'}
                  onChange={(value) => handleSettingChange('resizeMode', value as 'fit' | 'crop')}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  {localSettings.resizeMode === 'fit' 
                    ? 'Fit within dimensions (may have empty space)' 
                    : 'Crop to fill dimensions (may crop edges)'}
                </p>
              </div>

              <div className="col-span-2">
                <Toggle
                  label="Maintain Aspect Ratio"
                  checked={localSettings.maintainAspectRatio !== false}
                  onChange={(checked) => handleSettingChange('maintainAspectRatio', checked)}
                  helperText="Automatically adjust height to match aspect ratio"
                />
              </div>
            </div>
          )}

          {/* Apply Resize Preset Button */}
          {isResizing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Quick preset application
                const aspect = (localSettings.width || 1920) / (localSettings.height || 1080);
                if (aspect > 1.7) {
                  handlePresetSelect(1920, 1080);
                } else if (aspect > 1.3) {
                  handlePresetSelect(1280, 960);
                } else {
                  handlePresetSelect(1080, 1350);
                }
              }}
              leftIcon={<Scissors className="h-4 w-4" />}
              className="w-full"
            >
              Apply Common Aspect Ratio Preset
            </Button>
          )}

          {/* Reset Button */}
          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="text-slate-500 hover:text-slate-700"
            >
              Reset to Defaults
            </Button>
          </div>

          {/* Active Settings Summary */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Active Settings</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Format: <span className="font-medium">{formatLabel}</span></p>
              <p>Quality: <span className="font-medium">{localSettings.quality || 80}%</span></p>
              {isScaling && (
                <p>Scale: <span className="font-medium">{localSettings.scale || 100}%</span></p>
              )}
              {isResizing && (
                <p>
                  Resize: <span className="font-medium">
                    {localSettings.width || 'Auto'} × {localSettings.height || 'Auto'}
                  </span>
                  <span className="ml-1 text-blue-500">
                    ({localSettings.resizeMode || 'fit'})
                  </span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
