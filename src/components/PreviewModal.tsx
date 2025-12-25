import * as React from 'react';
import { cn } from '../lib/cn';
import { formatBytes } from '../lib/format';
import type { ImageItem } from '../types/image';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCcw,
} from 'lucide-react';

export interface PreviewModalProps {
  image: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function PreviewModal({
  image,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: PreviewModalProps) {
  const [zoom, setZoom] = React.useState(1);
  const [showInfo, setShowInfo] = React.useState(false);
  const [compareMode, setCompareMode] = React.useState<'original' | 'processed' | 'side-by-side'>('side-by-side');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Reset state when image changes
  React.useEffect(() => {
    if (image) {
      setZoom(1);
      setCompareMode('side-by-side');
    }
  }, [image]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!isOpen || !image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious && onPrevious) onPrevious();
          break;
        case 'ArrowRight':
          if (hasNext && onNext) onNext();
          break;
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 0.25, 3));
          break;
        case '-':
          setZoom((z) => Math.max(z - 0.25, 0.25));
          break;
        case '0':
          setZoom(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, image, onClose, onPrevious, onNext, hasPrevious, hasNext]);

  // Calculate savings percentage
  const savingsPercentage =
    image?.status === 'done' && image.processedSize && image.originalSize
      ? Math.round(((image.originalSize - image.processedSize) / image.originalSize) * 100)
      : null;

  const handleDownload = () => {
    if (image?.processedBlob) {
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

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleZoomReset = () => setZoom(1);

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 transition-opacity"
        onClick={onClose}
      />

      {/* Header - Responsive with wrapping */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        {/* Left side: Title and savings */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors touch-manipulation"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <h2 className="text-white font-medium text-sm truncate max-w-[150px] sm:max-w-xs">
            {image.file.name}
          </h2>
          {image.status === 'done' && savingsPercentage !== null && (
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-semibold rounded-full hidden sm:inline-block',
                savingsPercentage > 0
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              )}
            >
              {savingsPercentage > 0 ? '-' : '+'}
              {Math.abs(savingsPercentage)}%
            </span>
          )}
        </div>

        {/* Right side: Navigation and zoom controls */}
        <div className="flex items-center gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 touch-manipulation"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 touch-manipulation"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded hover:bg-white/20 transition-colors touch-manipulation"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4 text-white" />
            </button>
            <span className="text-white text-xs w-10 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded hover:bg-white/20 transition-colors touch-manipulation"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-2 rounded hover:bg-white/20 transition-colors touch-manipulation"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              'p-2 rounded-full transition-colors touch-manipulation',
              showInfo ? 'bg-white/20' : 'hover:bg-white/10'
            )}
            aria-label="Toggle info"
          >
            <Info className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Compare mode toggle - Second row on mobile */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900/60 border-b border-white/5">
        <button
          onClick={() => setCompareMode('original')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded transition-colors touch-manipulation',
            compareMode === 'original'
              ? 'bg-white text-slate-900'
              : 'text-white hover:bg-white/10'
          )}
        >
          Original
        </button>
        <button
          onClick={() => setCompareMode('side-by-side')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded transition-colors touch-manipulation',
            compareMode === 'side-by-side'
              ? 'bg-white text-slate-900'
              : 'text-white hover:bg-white/10'
          )}
        >
          Split
        </button>
        {image.processedBlob && (
          <button
            onClick={() => setCompareMode('processed')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded transition-colors touch-manipulation',
              compareMode === 'processed'
                ? 'bg-white text-slate-900'
                : 'text-white hover:bg-white/10'
            )}
          >
            Processed
          </button>
        )}
      </div>

      {/* Image container - Scrollable */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative flex items-center justify-center p-2"
      >
        {/* Images */}
        <div
          className="relative"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          {compareMode === 'side-by-side' && image.processedBlob ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Original image */}
              <div className="relative">
                <img
                  src={image.preview}
                  alt="Original"
                  className="max-h-[40vh] sm:max-h-[70vh] max-w-[90vw] object-contain rounded-lg"
                />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                  Original
                </span>
              </div>
              {/* Processed image */}
              <div className="relative">
                <img
                  src={URL.createObjectURL(image.processedBlob)}
                  alt="Processed"
                  className="max-h-[40vh] sm:max-h-[70vh] max-w-[90vw] object-contain rounded-lg"
                />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                  {image.options.format.toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <img
              src={compareMode === 'original' ? image.preview : image.processedBlob ? URL.createObjectURL(image.processedBlob) : image.preview}
              alt={image.file.name}
              className="max-h-[70vh] max-w-[90vw] object-contain rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <Card className="absolute top-20 right-4 w-64 sm:w-72 p-4 animate-in slide-in-from-bottom-2 z-10">
          <h3 className="font-medium text-slate-900 mb-3">Image Info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">File Name</dt>
              <dd className="font-medium text-slate-900 truncate max-w-40">
                {image.file.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Original Size</dt>
              <dd className="font-medium text-slate-900">
                {formatBytes(image.originalSize)}
              </dd>
            </div>
            {image.processedSize && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Processed Size</dt>
                <dd className="font-medium text-slate-900">
                  {formatBytes(image.processedSize)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Format</dt>
              <dd className="font-medium text-slate-900">
                {image.options.format.toUpperCase()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Quality</dt>
              <dd className="font-medium text-slate-900">
                {image.options.quality}%
              </dd>
            </div>
            {image.options.width && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Dimensions</dt>
                <dd className="font-medium text-slate-900">
                  {image.options.width} × {image.options.height || 'Auto'}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {/* Keyboard shortcuts hint - Hide on mobile */}
      <div className="hidden sm:block absolute bottom-4 left-4 px-3 py-2 bg-black/60 rounded-lg text-white text-xs">
        <span className="mr-3">← → Navigate</span>
        <span className="mr-3">+/- Zoom</span>
        <span>Esc Close</span>
      </div>

      {/* Bottom action bar - Sticky for mobile */}
      <div className="sticky bottom-0 border-t border-white/10 bg-slate-900/95 backdrop-blur-sm p-3 safe-area-pb">
        <div className="flex items-center justify-between gap-2">
          {/* Savings badge on mobile */}
          {image.status === 'done' && savingsPercentage !== null && (
            <span
              className={cn(
                'px-2 py-1 text-xs font-semibold rounded-full sm:hidden',
                savingsPercentage > 0
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              )}
            >
              {savingsPercentage > 0 ? '-' : '+'}
              {Math.abs(savingsPercentage)}% ({formatBytes(image.processedSize!)})
            </span>
          )}
          
          {/* Download button */}
          {image.status === 'done' && image.processedBlob && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownload}
              leftIcon={<Download className="h-5 w-5" />}
              className="flex-1"
            >
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
