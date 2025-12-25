import * as React from 'react';
import { cn } from '../lib/cn';
import { formatBytes } from '../lib/format';
import type { ImageItem } from '../types/image';
import { 
  TrendingDown, 
  TrendingUp,
  HardDrive,
  FileArchive,
  Image as ImageIcon,
  Zap
} from 'lucide-react';

interface DownloadStatsProps {
  images: ImageItem[];
  className?: string;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
}

/**
 * Animated number component that smoothly transitions between values
 */
function AnimatedNumber({ value, duration = 300, formatter }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const previousValue = React.useRef(value);

  React.useEffect(() => {
    if (value === previousValue.current) return;
    
    const startValue = previousValue.current;
    const endValue = value;
    const start = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
    return () => {
      previousValue.current = value;
    };
  }, [value, duration]);

  return <span>{formatter ? formatter(displayValue) : Math.round(displayValue).toLocaleString()}</span>;
}

export function DownloadStats({ images, className }: DownloadStatsProps) {
  // Get only processed images
  const processedImages = React.useMemo(() => {
    return images.filter((img) => img.status === 'done' && img.processedSize);
  }, [images]);

  // Calculate statistics
  const totalOriginalSize = React.useMemo(() => {
    return processedImages.reduce((total, img) => total + img.originalSize, 0);
  }, [processedImages]);

  const totalProcessedSize = React.useMemo(() => {
    return processedImages.reduce((total, img) => total + (img.processedSize || 0), 0);
  }, [processedImages]);

  const totalSavings = React.useMemo(() => {
    if (totalOriginalSize === 0) return 0;
    return totalOriginalSize - totalProcessedSize;
  }, [totalOriginalSize, totalProcessedSize]);

  const savingsPercentage = React.useMemo(() => {
    if (totalOriginalSize === 0) return 0;
    return Math.round((totalSavings / totalOriginalSize) * 100);
  }, [totalOriginalSize, totalSavings]);

  const imageCount = processedImages.length;

  if (imageCount === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900">Optimization Results</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Image Count */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Images</span>
          </div>
          <AnimatedNumber 
            value={imageCount} 
            formatter={(v) => `${v} processed`}
            duration={500}
          />
        </div>

        {/* Original Size */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <HardDrive className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Original</span>
          </div>
          <AnimatedNumber 
            value={totalOriginalSize} 
            formatter={(v) => formatBytes(v)}
            duration={500}
          />
        </div>

        {/* Processed Size */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <FileArchive className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Optimized</span>
          </div>
          <AnimatedNumber 
            value={totalProcessedSize} 
            formatter={(v) => formatBytes(v)}
            duration={500}
          />
        </div>

        {/* Savings */}
        <div className={cn(
          'rounded-lg p-3',
          savingsPercentage > 0 ? 'bg-green-50' : 'bg-red-50'
        )}>
          <div className={cn(
            'flex items-center gap-2 mb-1',
            savingsPercentage > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {savingsPercentage > 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span className="text-xs font-medium uppercase tracking-wide">Saved</span>
          </div>
          <div className={cn(
            'text-lg font-bold',
            savingsPercentage > 0 ? 'text-green-700' : 'text-red-700'
          )}>
            <AnimatedNumber 
              value={totalSavings} 
              formatter={(v) => formatBytes(v)}
              duration={500}
            />
            <span className="ml-1 text-sm">({savingsPercentage > 0 ? '-' : '+'}{savingsPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Savings Visualization Bar */}
      <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-500',
            savingsPercentage > 0 ? 'bg-green-500' : 'bg-red-500'
          )}
          style={{ width: `${Math.min(Math.abs(savingsPercentage), 100)}%` }}
        />
        {/* Original size marker */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-slate-400"
          style={{ left: 0 }}
        />
        {/* Processed size marker */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-slate-600"
          style={{ left: `${Math.min(100 - Math.abs(savingsPercentage), 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Original</span>
        <span>Optimized</span>
      </div>

      {/* Individual Image Savings (if few images) */}
      {imageCount <= 5 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Individual Savings</h4>
          <div className="space-y-1">
            {processedImages.slice(0, 5).map((img) => {
              const savings = img.originalSize - (img.processedSize || 0);
              const percentage = Math.round((savings / img.originalSize) * 100);
              
              return (
                <div 
                  key={img.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600 truncate max-w-[60%]">
                    {img.file.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {formatBytes(img.originalSize)} → {formatBytes(img.processedSize || 0)}
                    </span>
                    <span className={cn(
                      'font-medium w-12 text-right',
                      percentage > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {percentage > 0 ? '-' : '+'}{Math.abs(percentage)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


