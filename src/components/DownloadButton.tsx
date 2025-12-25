import * as React from 'react';
import { cn } from '../lib/cn';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { 
  Download, 
  Archive, 
  AlertCircle,
  CheckCircle2 
} from 'lucide-react';
import { 
  downloadBlob, 
  generateZip, 
  downloadMultiple, 
  formatFileSize,
  generateFilename,
  type DownloadItem 
} from '../lib/download';
import type { ImageItem } from '../types/image';

interface DownloadButtonProps {
  images: ImageItem[];
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
  className?: string;
}

export function DownloadButton({
  images,
  className,
  onDownloadComplete,
  onDownloadError,
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [zipProgress, setZipProgress] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Reset states when images change
  React.useEffect(() => {
    setError(null);
    setSuccess(false);
    setProgress(0);
    setZipProgress(false);
  }, [images]);

  // Get processed images
  const processedImages = React.useMemo(() => {
    return images.filter((img) => img.status === 'done' && img.processedBlob);
  }, [images]);

  // Calculate total savings
  const totalOriginalSize = React.useMemo(() => {
    return processedImages.reduce((total, img) => total + img.originalSize, 0);
  }, [processedImages]);

  const totalProcessedSize = React.useMemo(() => {
    return processedImages.reduce((total, img) => total + (img.processedSize || 0), 0);
  }, [processedImages]);

  const totalSavings = React.useMemo(() => {
    if (totalOriginalSize === 0) return 0;
    return Math.round(((totalOriginalSize - totalProcessedSize) / totalOriginalSize) * 100);
  }, [totalOriginalSize, totalProcessedSize]);

  const handleDownload = async () => {
    if (processedImages.length === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    const downloadItems: DownloadItem[] = processedImages.map((img) => ({
      blob: img.processedBlob!,
      filename: generateFilename(img.file.name, img.options.format),
    }));

    try {
      // Try ZIP download first for multiple images
      if (downloadItems.length > 1) {
        setZipProgress(true);
        const zipBlob = await generateZip(downloadItems, (p) => {
          setProgress(p);
        });
        
        const timestamp = new Date().toISOString().split('T')[0];
        downloadBlob(zipBlob, `optimized-images-${timestamp}.zip`);
        setZipProgress(false);
      } else {
        // Single file download
        downloadBlob(downloadItems[0].blob, downloadItems[0].filename);
        setProgress(100);
      }

      setSuccess(true);
      onDownloadComplete?.();

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      
      // Fallback to individual downloads
      if (downloadItems.length > 1) {
        try {
          setError('ZIP generation failed, falling back to individual downloads...');
          setZipProgress(false);
          
          await downloadMultiple(downloadItems, (completed, total) => {
            setProgress((completed / total) * 100);
          });
          
          setSuccess(true);
          onDownloadComplete?.();
          setError(null);
          
          setTimeout(() => setSuccess(false), 3000);
        } catch {
          setError('Download failed. Please try downloading individual files.');
          onDownloadError?.('Download failed');
        }
      } else {
        setError('Download failed. Please try again.');
        onDownloadError?.('Download failed');
      }
    } finally {
      setIsLoading(false);
      setZipProgress(false);
    }
  };

  if (processedImages.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <Button
        variant="primary"
        size="lg"
        isLoading={isLoading}
        onClick={handleDownload}
        disabled={processedImages.length === 0}
        leftIcon={success ? <CheckCircle2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        className={cn(
          'w-full transition-all duration-200',
          success && 'bg-green-600 hover:bg-green-700'
        )}
      >
        {success
          ? 'Download Complete!'
          : zipProgress
          ? 'Creating ZIP...'
          : `Download ${processedImages.length} Image${processedImages.length > 1 ? 's' : ''}`}
      </Button>

      {/* Progress bar */}
      {(isLoading || progress > 0) && (
        <Progress value={progress} size="sm" showLabel={zipProgress} />
      )}

      {/* Stats summary */}
      <div className="flex items-center justify-between text-sm bg-slate-50 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500">Original: </span>
            <span className="font-medium text-slate-700">{formatFileSize(totalOriginalSize)}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div>
            <span className="text-slate-500">Processed: </span>
            <span className="font-medium text-slate-700">{formatFileSize(totalProcessedSize)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Archive className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-green-600">
            -{totalSavings}%
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>
            {processedImages.length > 1 
              ? `Successfully downloaded ${processedImages.length} images!`
              : 'Image downloaded successfully!'}
          </span>
        </div>
      )}
    </div>
  );
}
