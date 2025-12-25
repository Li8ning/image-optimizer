import * as React from 'react';
import { cn } from '../../lib/cn';

export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  variant?: 'circular' | 'linear';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'linear',
      size = 'md',
      showLabel = false,
      className,
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes: Record<'sm' | 'md' | 'lg', Record<'circular' | 'linear', string>> = {
      sm: { circular: 'w-10 h-10', linear: 'h-1.5' },
      md: { circular: 'w-16 h-16', linear: 'h-2.5' },
      lg: { circular: 'w-24 h-24', linear: 'h-4' },
    };

    if (variant === 'circular') {
      const circumference = 2 * Math.PI * 45; // radius = 45
      const strokeDashoffset = circumference - (percentage / 100) * circumference;

      return (
        <div
          ref={ref}
          className={cn('relative inline-flex items-center justify-center', className)}
        >
          <svg
            className={cn('transform -rotate-90', sizes[size][variant])}
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-blue-600 transition-all duration-300 ease-out"
            />
          </svg>
          {showLabel && (
            <span className="absolute text-sm font-medium text-slate-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
      >
        <div
          className={cn(
            'w-full rounded-full bg-slate-200 overflow-hidden',
            sizes[size][variant]
          )}
        >
          <div
            className={cn(
              'h-full rounded-full bg-blue-600 transition-all duration-300 ease-out',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-medium text-slate-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
