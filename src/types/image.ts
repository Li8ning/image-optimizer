// Image format types
export type ImageFormat = 'webp' | 'jpeg' | 'png' | 'avif';

// Processing options
export interface ProcessOptions {
  format: ImageFormat;
  quality: number; // 0-100
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  preset?: 'web' | 'photo' | 'lossless';
  scale?: number; // Percentage-based scaling (e.g., 50 for 50%)
  resizeMode?: 'fit' | 'crop'; // 'fit' = fit within dimensions, 'crop' = crop to fill
}

// Image processing status
export type ImageStatus = 'pending' | 'processing' | 'done' | 'error';

// Individual image state
export interface ImageItem {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  processedBlob?: Blob;
  processedSize?: number;
  options: ProcessOptions;
  status: ImageStatus;
  error?: string;
}

// Global store state
export interface ImageStoreState {
  images: ImageItem[];
  globalSettings: Partial<ProcessOptions>;
  isProcessing: boolean;
  totalProgress: number;
}

// Resize preset type
export interface ResizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'common' | 'social' | 'thumbnail';
  aspectRatio?: string;
}
