import * as React from 'react';
import { cn } from '../lib/cn';
import { formatBytes } from '../lib/format';
import type { ImageItem } from '../types/image';
import { Card, CardContent } from './ui/Card';
import {
  FileImage,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Percent,
  Maximize2,
} from 'lucide-react';

export interface ImageInfoProps {
  image: ImageItem;
  className?: string;
}

export function ImageInfo({ image, className }: ImageInfoProps) {
  // Calculate savings
  const savings =
    image.status === 'done' && image.processedSize && image.originalSize
      ? image.originalSize - image.processedSize
      : null;
  const savingsPercentage =
    image.status === 'done' && image.processedSize && image.originalSize
      ? Math.round(((image.originalSize - image.processedSize) / image.originalSize) * 100)
      : null;

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          <FileImage className="h-4 w-4 text-blue-600" />
          Image Details
        </h3>

        {/* File name */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Name:</span>
          <span className="font-medium text-slate-900 truncate" title={image.file.name}>
            {image.file.name}
          </span>
        </div>

        {/* Original size */}
        <div className="flex items-center gap-2 text-sm">
          <ArrowUpFromLine className="h-4 w-4 text-slate-400" />
          <span className="text-slate-500">Original:</span>
          <span className="font-medium text-slate-900">
            {formatBytes(image.originalSize)}
          </span>
        </div>

        {/* Processed size */}
        {image.status === 'done' && image.processedSize && (
          <div className="flex items-center gap-2 text-sm">
            <ArrowDownToLine className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Processed:</span>
            <span className="font-medium text-slate-900">
              {formatBytes(image.processedSize)}
            </span>
          </div>
        )}

        {/* Savings */}
        {savings !== null && savingsPercentage !== null && (
          <div
            className={cn(
              'flex items-center gap-2 text-sm px-3 py-2 rounded-lg',
              savings > 0
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            )}
          >
            <Percent className={cn('h-4 w-4', savings > 0 ? 'text-green-600' : 'text-red-600')} />
            <span className="font-medium">
              {savings > 0 ? 'Saved' : 'Increased'} {formatBytes(Math.abs(savings))} ({savingsPercentage > 0 ? '-' : '+'}
              {Math.abs(savingsPercentage)}%)
            </span>
          </div>
        )}

        {/* Format */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Format:</span>
          <span className="font-medium text-slate-900 uppercase">
            {image.options.format}
          </span>
        </div>

        {/* Quality */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Quality:</span>
          <span className="font-medium text-slate-900">{image.options.quality}%</span>
        </div>

        {/* Dimensions */}
        {(image.options.width || image.options.height) && (
          <div className="flex items-center gap-2 text-sm">
            <Maximize2 className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Resize:</span>
            <span className="font-medium text-slate-900">
              {image.options.width} × {image.options.height || 'Auto'}
            </span>
          </div>
        )}

        {/* Processing time */}
        {image.status === 'done' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Processed:</span>
            <span className="font-medium text-slate-900">Complete</span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Status:</span>
          <span
            className={cn(
              'font-medium capitalize',
              image.status === 'done' && 'text-green-600',
              image.status === 'processing' && 'text-blue-600',
              image.status === 'pending' && 'text-slate-500',
              image.status === 'error' && 'text-red-600'
            )}
          >
            {image.status}
          </span>
        </div>

        {/* Error message */}
        {image.status === 'error' && image.error && (
          <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
            <span className="font-medium">Error: </span>
            {image.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for use in grid cards
export function ImageInfoCompact({ image }: { image: ImageItem }) {
  const savingsPercentage =
    image.status === 'done' && image.processedSize && image.originalSize
      ? Math.round(((image.originalSize - image.processedSize) / image.originalSize) * 100)
      : null;

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-slate-500">{formatBytes(image.originalSize)}</span>
      {image.status === 'done' && image.processedSize && (
        <>
          <ArrowDownToLine className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">
            {formatBytes(image.processedSize)}
          </span>
          {savingsPercentage !== null && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                savingsPercentage > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {savingsPercentage > 0 ? '-' : '+'}
              {Math.abs(savingsPercentage)}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
