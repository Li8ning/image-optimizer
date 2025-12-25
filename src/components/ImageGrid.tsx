import * as React from 'react';
import { cn } from '../lib/cn';
import type { ImageItem, ImageFormat, ProcessOptions } from '../types/image';
import { ImageCard } from './ImageCard';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import { Input } from './ui/Input';
import { Image as ImageIcon, Trash2, Settings, X } from 'lucide-react';

const formatOptions = [
  { value: 'webp', label: 'WebP' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'avif', label: 'AVIF' },
];

interface IndividualSettingsPanelProps {
  image: ImageItem;
  onUpdate: (options: Partial<ProcessOptions>) => void;
  onClose: () => void;
}

function IndividualSettingsPanel({ image, onUpdate, onClose }: IndividualSettingsPanelProps) {
  const [localOptions, setLocalOptions] = React.useState<Partial<ProcessOptions>>(image.options);

  const handleSettingChange = (key: keyof ProcessOptions, value: unknown) => {
    const newOptions = { ...localOptions, [key]: value };
    setLocalOptions(newOptions);
    onUpdate(newOptions);
  };

  const isResizing = localOptions.width !== undefined || localOptions.height !== undefined;

  return (
    <Card className="w-full animate-in slide-in-from-top-2 duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">Settings: {image.file.name}</CardTitle>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100 transition-colors"
          aria-label="Close settings"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          label="Output Format"
          options={formatOptions}
          value={localOptions.format || 'webp'}
          onChange={(value) => handleSettingChange('format', value as ImageFormat)}
        />

        <Slider
          label="Quality"
          value={localOptions.quality || 80}
          onChange={(value) => handleSettingChange('quality', value)}
          min={0}
          max={100}
          step={5}
          helperText="Higher quality means larger file size"
        />

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
          helperText="Scale down large images to specified dimensions"
        />

        {isResizing && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <Input
              type="number"
              label="Width (px)"
              value={localOptions.width || ''}
              onChange={(e) => handleSettingChange('width', parseInt(e.target.value) || undefined)}
              placeholder="1920"
              min={1}
            />
            <Input
              type="number"
              label="Height (px)"
              value={localOptions.height || ''}
              onChange={(e) => handleSettingChange('height', parseInt(e.target.value) || undefined)}
              placeholder="Auto"
              min={1}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export interface ImageGridProps {
  images: ImageItem[];
  onRemove: (id: string) => void;
  onSettingsToggle: (id: string) => void;
  onUpdateImageOptions: (id: string, options: Partial<ImageItem['options']>) => void;
  onPreview: (id: string) => void;
  expandedSettingsId: string | null;
  className?: string;
}

export function ImageGrid({
  images,
  onRemove,
  onSettingsToggle,
  onUpdateImageOptions,
  onPreview,
  expandedSettingsId,
  className,
}: ImageGridProps) {
  // Sort images: processing first, then pending, then done, then error
  const sortedImages = React.useMemo(() => {
    const statusOrder: Record<ImageItem['status'], number> = {
      processing: 0,
      pending: 1,
      done: 2,
      error: 3,
    };

    return [...images].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      // Secondary sort by name
      return a.file.name.localeCompare(b.file.name);
    });
  }, [images]);

  // Find the expanded image for individual settings
  const expandedImage = React.useMemo(
    () => images.find((img) => img.id === expandedSettingsId),
    [images, expandedSettingsId]
  );

  if (images.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">No images yet</h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload images to get started with optimization
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Images count and clear all button */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </p>
        {images.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to remove all images?')) {
                images.forEach((img) => onRemove(img.id));
              }
            }}
            className="text-slate-600 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Image grid with scrollable container */}
      <div
        className={cn(
          'grid gap-4 overflow-y-auto max-h-[425px] pr-2',
          'grid-cols-1', // Mobile
          'sm:grid-cols-2', // Tablet
          'lg:grid-cols-3' // Desktop
        )}
      >
        {sortedImages.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onRemove={onRemove}
            onSettingsToggle={onSettingsToggle}
            onPreview={onPreview}
            showSettings={expandedSettingsId === image.id}
          />
        ))}
      </div>

      {/* Individual settings panel for expanded image */}
      {expandedImage && (
        <IndividualSettingsPanel
          image={expandedImage}
          onUpdate={(options) => onUpdateImageOptions(expandedImage.id, options)}
          onClose={() => onSettingsToggle(expandedImage.id)}
        />
      )}
    </div>
  );
}
