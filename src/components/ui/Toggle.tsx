import * as React from 'react';
import { cn } from '../../lib/cn';

export interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    { label, checked, onChange, disabled = false, className, helperText },
    ref
  ) => {
    const internalId = React.useId();
    const toggleId = `toggle-${internalId}`;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange(!checked);
      }
    };

    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'text-sm font-medium text-slate-700 cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}
          <button
            ref={ref}
            type="button"
            role="switch"
            aria-checked={checked}
            id={toggleId}
            onClick={() => !disabled && onChange(!checked)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              checked ? 'bg-blue-600' : 'bg-slate-300',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && 'cursor-pointer'
            )}
            aria-label={label}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                checked ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
        {helperText && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
