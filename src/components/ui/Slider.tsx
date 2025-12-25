import * as React from 'react';
import { cn } from '../../lib/cn';

export interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
  helperText?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      label,
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      className,
      showValue = true,
      helperText,
    },
    _ref
  ) => {
    const internalId = React.useId();
    const sliderId = `slider-${internalId}`;
    const percentage = ((value - min) / (max - min)) * 100;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      const stepAmount = step || 1;
      let newValue = value;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(value + stepAmount, max);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(value - stepAmount, min);
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
      }

      if (newValue !== value) {
        onChange(newValue);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    };

    const handleMouseDown = () => {
      const container = document.getElementById(sliderId);
      container?.classList.add('cursor-grabbing');
    };

    const handleMouseUp = () => {
      const container = document.getElementById(sliderId);
      container?.classList.remove('cursor-grabbing');
    };

    return (
      <div className={cn('w-full', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label
                htmlFor={sliderId}
                className="block text-sm font-medium text-slate-700"
              >
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-medium text-blue-600 min-w-[3rem] text-right">
                {value}
              </span>
            )}
          </div>
        )}
        <div
          id={sliderId}
          className={cn(
            'relative h-2 bg-slate-200 rounded-full cursor-pointer transition-all',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* Track fill */}
          <div
            className="absolute h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />

          {/* Thumb */}
          <input
            type="range"
            id={sliderId}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            disabled={disabled}
            className={cn(
              'absolute w-full h-full opacity-0 cursor-pointer z-10',
              disabled && 'cursor-not-allowed'
            )}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={label}
          />

          {/* Custom thumb */}
          <div
            className={cn(
              'absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md',
              'top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            style={{ left: `${percentage}%` }}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={label}
            onKeyDown={handleKeyDown}
          />
        </div>
        {helperText && !label && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
