import * as React from 'react';
import type { ResizePreset } from '../types/image';
import { cn } from '../lib/cn';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Monitor, Smartphone, Crop, ArrowRight } from 'lucide-react';

// Common size presets
const commonPresets: ResizePreset[] = [
  { id: 'hd', name: 'HD', width: 1280, height: 720, category: 'common', aspectRatio: '16:9' },
  { id: 'fhd', name: 'Full HD', width: 1920, height: 1080, category: 'common', aspectRatio: '16:9' },
  { id: '2k', name: '2K', width: 2560, height: 1440, category: 'common', aspectRatio: '16:9' },
  { id: '4k', name: '4K', width: 3840, height: 2160, category: 'common', aspectRatio: '16:9' },
  { id: 'wxga', name: 'WXGA', width: 1280, height: 800, category: 'common', aspectRatio: '16:10' },
];

// Social media presets
const socialPresets: ResizePreset[] = [
  { id: 'ig-square', name: 'Instagram Square', width: 1080, height: 1080, category: 'social', aspectRatio: '1:1' },
  { id: 'ig-portrait', name: 'Instagram Portrait', width: 1080, height: 1350, category: 'social', aspectRatio: '4:5' },
  { id: 'twitter', name: 'Twitter/X', width: 1200, height: 675, category: 'social', aspectRatio: '16:9' },
  { id: 'facebook', name: 'Facebook', width: 1200, height: 630, category: 'social', aspectRatio: '1.91:1' },
  { id: 'linkedin', name: 'LinkedIn', width: 1200, height: 627, category: 'social', aspectRatio: '1.91:1' },
  { id: 'youtube', name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'social', aspectRatio: '16:9' },
];

// Thumbnail preset
const thumbnailPresets: ResizePreset[] = [
  { id: 'thumb-small', name: 'Small', width: 150, height: 150, category: 'thumbnail', aspectRatio: '1:1' },
  { id: 'thumb-medium', name: 'Medium', width: 300, height: 300, category: 'thumbnail', aspectRatio: '1:1' },
  { id: 'thumb-large', name: 'Large', width: 500, height: 500, category: 'thumbnail', aspectRatio: '1:1' },
];

interface ResizePresetsProps {
  className?: string;
  onSelectPreset?: (width: number, height: number) => void;
}

export function ResizePresets({ className, onSelectPreset }: ResizePresetsProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState<'common' | 'social' | 'thumbnail'>('common');

  const handlePresetClick = (preset: ResizePreset) => {
    onSelectPreset?.(preset.width, preset.height);
  };

  const getCategoryIcon = (category: 'common' | 'social' | 'thumbnail') => {
    switch (category) {
      case 'common':
        return <Monitor className="h-4 w-4" />;
      case 'social':
        return <Smartphone className="h-4 w-4" />;
      case 'thumbnail':
        return <Crop className="h-4 w-4" />;
    }
  };

  const getCurrentPresets = () => {
    switch (activeCategory) {
      case 'common':
        return commonPresets;
      case 'social':
        return socialPresets;
      case 'thumbnail':
        return thumbnailPresets;
    }
  };

  const formatDimensions = (width: number, height: number) => {
    if (width >= 3840) return `${Math.round(width / 3840)}K`;
    if (width >= 1920) return `${Math.round(width / 1920)}K`;
    return `${width}×${height}`;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Crop className="h-5 w-5 text-purple-600" />
          <CardTitle>Resize Presets</CardTitle>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-slate-100 transition-colors"
          aria-label={isCollapsed ? 'Expand presets' : 'Collapse presets'}
        >
          {isCollapsed ? (
            <ArrowRight className="h-5 w-5 text-slate-500" />
          ) : (
            <ArrowRight className="h-5 w-5 text-slate-500 rotate-90" />
          )}
        </button>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Category tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            {(['common', 'social', 'thumbnail'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
                  activeCategory === category
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>

          {/* Presets grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {getCurrentPresets().map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-lg border-2 transition-all',
                  'hover:border-purple-300 hover:bg-purple-50',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
                  'text-left'
                )}
              >
                <span className="text-sm font-semibold text-slate-900">{preset.name}</span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {formatDimensions(preset.width, preset.height)}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-slate-400">{preset.width}×{preset.height}</span>
                  {preset.aspectRatio && (
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                      {preset.aspectRatio}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Quick apply hint */}
          <p className="text-xs text-slate-500 text-center">
            Click a preset to quickly apply those dimensions
          </p>
        </CardContent>
      )}
    </Card>
  );
}

// Export presets for use in other components
export { commonPresets, socialPresets, thumbnailPresets };
