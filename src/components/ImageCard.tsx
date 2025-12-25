import * as React from 'react';
import { cn } from '../lib/cn';
import { formatBytes } from '../lib/format';
import type { ImageItem, ImageStatus } from '../types/image';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import {
  X,
  Download,
  Settings2,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';

export interface ImageCardProps {
  image: ImageItem;
  onRemove: (id: string) => void;
  onSettingsToggle: (id: string) => void;
  onPreview: (id: string) => void;
  showSettings?: boolean;
  className?: string;
}

const statusConfig: Record<
  ImageStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  pending: {
    icon: <ImageIcon className="h-4 w-4" />,
    color: 'text-slate-500',
    label: 'Pending',
  },
  processing: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'text-blue-500',
    label: 'Processing',
  },
  done: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-500',
    label: 'Done',
  },
  error: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-red-500',
    label: 'Error',
  },
};

const ImageCard = React.forwardRef<HTMLDivElement, ImageCardProps>(
  (
    {
      image,
      onRemove,
      onSettingsToggle,
      onPreview,
      showSettings = false,
      className,
    },
    ref
  ) => {
    const status = statusConfig[image.status];

    // Calculate savings percentage
    const savingsPercentage =
      image.status === 'done' && image.processedSize && image.originalSize
        ? Math.round(
            ((image.originalSize - image.processedSize) / image.originalSize) *
              100
          )
        : null;

    // Create processed preview URL if available
    const processedPreview = React.useMemo(() => {
      if (image.processedBlob) {
        return URL.createObjectURL(image.processedBlob);
      }
      return null;
    }, [image.processedBlob]);

    React.useEffect(() => {
      return () => {
        if (processedPreview) {
          URL.revokeObjectURL(processedPreview);
        }
      };
    }, [processedPreview]);

    const handleDownload = () => {
      if (image.processedBlob && image.processedSize) {
        const extension = image.options.format;
        const baseName = image.file.name.replace(/\.[^/.]+$/, '');
        const fileName = `${baseName}.${extension}`;
        const url = URL.createObjectURL(image.processedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'group relative overflow-hidden transition-all duration-200 hover:shadow-md',
          image.status === 'error' && 'border-red-200 bg-red-50',
          className
        )}
      >
        {/* Status indicator bar */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1',
            image.status === 'processing' && 'bg-blue-500',
            image.status === 'done' && 'bg-green-500',
            image.status === 'error' && 'bg-red-500',
            image.status === 'pending' && 'bg-slate-300'
          )}
        />

        {/* Image preview */}
        <div
          className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
          onClick={() => onPreview(image.id)}
        >
          <img
            src={processedPreview || image.preview}
            alt={image.file.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>

          {/* Processing overlay */}
          {image.status === 'processing' && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Progress value={0} variant="circular" size="md" showLabel />
            </div>
          )}

          {/* Error overlay */}
          {image.status === 'error' && (
            <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">{image.error || 'Processing failed'}</p>
              </div>
            </div>
          )}

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(image.id);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-500"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Card content */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate" title={image.file.name}>
                {image.file.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('flex items-center gap-1 text-xs', status.color)}>
                  {status.icon}
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Size comparison */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Original</p>
                <p className="font-medium text-slate-700">{formatBytes(image.originalSize)}</p>
              </div>
              {image.status === 'done' && image.processedSize && (
                <>
                  <span className="text-slate-300">→</span>
                  <div>
                    <p className="text-xs text-slate-500">Processed</p>
                    <p className="font-medium text-slate-700">
                      {formatBytes(image.processedSize)}
                    </p>
                  </div>
                </>
              )}
            </div>
            {savingsPercentage !== null && image.status === 'done' && (
              <div
                className={cn(
                  'text-xs font-semibold px-2 py-1 rounded-full',
                  savingsPercentage > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {savingsPercentage > 0 ? '-' : '+'}
                {Math.abs(savingsPercentage)}%
              </div>
            )}
          </div>

          {/* Settings toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-slate-600"
            onClick={() => onSettingsToggle(image.id)}
          >
            <Settings2 className="h-4 w-4 mr-1" />
            {showSettings ? 'Hide Settings' : 'Individual Settings'}
          </Button>
        </CardContent>

        {/* Card footer with download button */}
        <CardFooter className="p-4 pt-0">
          {image.status === 'done' && image.processedBlob && (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleDownload}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download {image.options.format.toUpperCase()}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
);

ImageCard.displayName = 'ImageCard';

export { ImageCard };
