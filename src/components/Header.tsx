import { Image, Zap } from 'lucide-react';
import { cn } from '../lib/cn';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'w-full bg-white border-b border-slate-200 shadow-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white">
              <Image className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900">Image Optimizer</h1>
              <p className="text-xs text-slate-500 hidden md:block">
                Compress & optimize your images
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Client-side only</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
