import type { ImageFormat } from '../types/image';

/**
 * Format bytes to human readable file size
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Get image dimensions from a File
 * @param file - Image file
 * @returns Promise resolving to width and height
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Get file extension from format
 * @param format - Image format
 * @returns File extension with dot (e.g., ".webp")
 */
export function getFileExtension(format: ImageFormat): string {
  const extensions: Record<ImageFormat, string> = {
    webp: '.webp',
    jpeg: '.jpg',
    png: '.png',
    avif: '.avif',
  };

  return extensions[format];
}

/**
 * Get MIME type from format
 * @param format - Image format
 * @returns MIME type string
 */
export function getMimeType(format: ImageFormat): string {
  const mimeTypes: Record<ImageFormat, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png: 'image/png',
    avif: 'image/avif',
  };

  return mimeTypes[format];
}

/**
 * Format quality percentage
 * @param quality - Quality value (0-100)
 * @returns Formatted quality string (e.g., "80%")
 */
export function formatQuality(quality: number): string {
  return `${quality}%`;
}

/**
 * Calculate aspect ratio from width and height
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @returns Aspect ratio string (e.g., "16:9")
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Calculate new dimensions maintaining aspect ratio
 * @param originalWidth - Original width
 * @param originalHeight - Original height
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns New dimensions
 */
export function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let newWidth = maxWidth;
  let newHeight = newWidth / aspectRatio;

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Format time duration in milliseconds to human readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted time string (e.g., "2.5s", "500ms")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  const seconds = ms / 1000;
  if (seconds < 60) {
    const formatted = seconds.toFixed(1);
    return `${parseFloat(formatted)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get a descriptive name for a preset
 * @param preset - Preset name
 * @returns Human readable preset name
 */
export function getPresetName(preset?: 'web' | 'photo' | 'lossless'): string {
  const names: Record<string, string> = {
    web: 'Web Optimized',
    photo: 'Photo Quality',
    lossless: 'Lossless',
  };

  return preset ? names[preset] : 'Custom';
}
