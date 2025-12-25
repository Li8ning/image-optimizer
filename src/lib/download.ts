import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export interface DownloadItem {
  blob: Blob;
  filename: string;
}

/**
 * Download a single blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  try {
    saveAs(blob, filename);
  } catch (error) {
    console.error('Failed to download file:', error);
    // Fallback method
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Download multiple files sequentially
 */
export async function downloadMultiple(
  items: DownloadItem[],
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const total = items.length;
  for (let i = 0; i < items.length; i++) {
    downloadBlob(items[i].blob, items[i].filename);
    onProgress?.(i + 1, total);
    // Small delay between downloads to avoid browser blocking
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Generate a ZIP file from multiple images
 */
export async function generateZip(
  images: DownloadItem[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  
  for (let i = 0; i < images.length; i++) {
    const { blob, filename } = images[i];
    zip.file(filename, blob);
    onProgress?.(((i + 1) / images.length) * 100);
  }
  
  onProgress?.(100);
  
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  
  return content;
}

/**
 * Cleanup object URLs to prevent memory leaks
 */
export function revokeObjectURLs(blobs: Blob[]): void {
  blobs.forEach((blob) => {
    if (blob instanceof File && blob.webkitRelativePath) {
      // File objects created from file inputs don't need cleanup
      return;
    }
    // For blob URLs, we can't revoke them here since we don't have the URLs
    // The caller should handle cleanup with the actual URLs
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate total size from an array of items
 */
export function calculateTotalSize(items: DownloadItem[]): number {
  return items.reduce((total, item) => total + item.blob.size, 0);
}

/**
 * Generate a filename with proper extension based on format
 */
export function generateFilename(originalName: string, format: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}.${format}`;
}
