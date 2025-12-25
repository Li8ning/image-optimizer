import * as React from 'react';
import { cn } from '../../lib/cn';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, label, error, options, placeholder, value, onChange, disabled, id }, _ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const internalId = React.useId();
    const selectId = id || internalId;

    const selectedOption = options.find(opt => opt.value === value);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
            const option = options[focusedIndex];
            if (!option.disabled) {
              onChange?.(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(!isOpen);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(prev => {
            let next = prev + 1;
            while (next < options.length && options[next].disabled) {
              next++;
            }
            return next >= options.length ? prev : next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(prev => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) {
              next--;
            }
            return next < 0 ? prev : next;
          });
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    const handleOptionClick = (optionValue: string) => {
      if (!options.find(o => o.value === optionValue)?.disabled) {
        onChange?.(optionValue);
        setIsOpen(false);
      }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm',
              'bg-white text-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300',
              className
            )}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={error ? 'true' : 'false'}
            id={selectId}
          >
            <span className={cn(!selectedOption && 'text-slate-400')}>
              {selectedOption?.label || placeholder || 'Select an option'}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-slate-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <div
              className={cn(
                'absolute z-50 w-full mt-1 py-1 bg-white rounded-lg border border-slate-200 shadow-lg',
                'max-h-60 overflow-auto'
              )}
              role="listbox"
              aria-label={label}
            >
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm',
                    'hover:bg-slate-100',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    option.value === value && 'bg-blue-50 text-blue-700',
                    focusedIndex === index && 'bg-slate-100'
                  )}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
