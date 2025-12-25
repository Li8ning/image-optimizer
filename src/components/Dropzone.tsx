import * as React from 'react';
import { cn } from '../lib/cn';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
}

export function Dropzone({
  onFilesSelected,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  className,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));

    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (files: File[]) => {
    // Filter by accept type
    const acceptedFiles = files.filter(file => {
      if (!accept) return true;
      const acceptedTypes = accept.split(',').map(t => t.trim());
      return acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });
    });

    // Check size
    const validFiles = acceptedFiles.filter(file => file.size <= maxSize);

    if (validFiles.length > 0) {
      onFilesSelected(multiple ? validFiles : [validFiles[0]]);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-blue-400 hover:bg-blue-50/50',
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-slate-300 bg-slate-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload images"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-14 h-14 rounded-full transition-colors',
              isDragOver ? 'bg-blue-100' : 'bg-slate-100'
            )}
          >
            <Upload
              className={cn(
                'w-7 h-7 transition-colors',
                isDragOver ? 'text-blue-600' : 'text-slate-400'
              )}
            />
          </div>

          <div>
            <p className="text-lg font-medium text-slate-700">
              {isDragOver ? 'Drop images here' : 'Drag & drop images'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or click to browse
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              PNG, JPG, GIF, WebP
            </span>
            <span>Max {Math.round(maxSize / (1024 * 1024))}MB</span>
            {multiple && <span>Multiple files</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
