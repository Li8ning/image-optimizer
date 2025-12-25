import { useCallback, useMemo } from 'react';
import { useImageStore as useStore, selectImages, selectImageCount, selectIsProcessing, selectTotalProgress, selectGlobalSettings, selectPendingImages, selectProcessedImages } from '../store/imageStore';
import type { ImageItem, ProcessOptions } from '../types/image';

/**
 * Custom hook for accessing the image store with typed selectors
 * Provides memoized selectors for efficient re-renders
 */
export function useImageStore() {
  const store = useStore();

  return {
    // State
    images: store.images,
    globalSettings: store.globalSettings,
    isProcessing: store.isProcessing,
    totalProgress: store.totalProgress,

    // Image Actions
    addImages: store.addImages,
    removeImage: store.removeImage,
    updateImageOptions: store.updateImageOptions,
    setImageStatus: store.setImageStatus,
    setProcessedImage: store.setProcessedImage,
    updateGlobalSettings: store.updateGlobalSettings,
    clearAll: store.clearAll,
    getImage: store.getImage,
  };
}

/**
 * Hook to access images array with memoization
 */
export function useImages(): ImageItem[] {
  return useStore(selectImages);
}

/**
 * Hook to access image count
 */
export function useImageCount(): number {
  return useStore(selectImageCount);
}

/**
 * Hook to check if processing is active
 */
export function useIsProcessing(): boolean {
  return useStore(selectIsProcessing);
}

/**
 * Hook to access total progress
 */
export function useTotalProgress(): number {
  return useStore(selectTotalProgress);
}

/**
 * Hook to access global settings
 */
export function useGlobalSettings(): Partial<ProcessOptions> {
  return useStore(selectGlobalSettings);
}

/**
 * Hook to access pending images
 */
export function usePendingImages(): ImageItem[] {
  return useStore(selectPendingImages);
}

/**
 * Hook to access processed images
 */
export function useProcessedImages(): ImageItem[] {
  return useStore(selectProcessedImages);
}

/**
 * Hook to get a single image by ID
 * Returns a memoized callback to find the image
 */
export function useGetImage() {
  const images = useImages();

  return useCallback(
    (id: string) => images.find((img) => img.id === id),
    [images]
  );
}

/**
 * Hook to update image options with memoization
 */
export function useUpdateImageOptions() {
  const updateImageOptions = useStore((state) => state.updateImageOptions);

  return useCallback(
    (id: string, options: Partial<ProcessOptions>) => {
      updateImageOptions(id, options);
    },
    [updateImageOptions]
  );
}

/**
 * Hook to get formatted file size savings
 */
export function useTotalSavings() {
  const images = useProcessedImages();

  return useMemo(() => {
    const originalSize = images.reduce((acc, img) => acc + img.originalSize, 0);
    const processedSize = images.reduce(
      (acc, img) => acc + (img.processedSize || img.originalSize),
      0
    );
    const savings = originalSize - processedSize;
    const percentage = originalSize > 0 ? parseFloat(((savings / originalSize) * 100).toFixed(1)) : 0;

    return {
      originalSize,
      processedSize,
      savings,
      percentage,
    };
  }, [images]);
}

/**
 * Hook to check if all images are processed
 */
export function useAllProcessed(): boolean {
  const images = useImages();
  const isProcessing = useIsProcessing();

  return useMemo(() => {
    if (images.length === 0) return false;
    return images.every((img) => img.status === 'done') && !isProcessing;
  }, [images, isProcessing]);
}

/**
 * Hook to get images grouped by status
 */
export function useImagesByStatus() {
  const images = useImages();

  return useMemo(() => {
    return {
      pending: images.filter((img) => img.status === 'pending'),
      processing: images.filter((img) => img.status === 'processing'),
      done: images.filter((img) => img.status === 'done'),
      error: images.filter((img) => img.status === 'error'),
    };
  }, [images]);
}
