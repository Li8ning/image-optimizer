import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ImageItem, ImageStatus, ProcessOptions } from '../types/image';

interface ImageStore {
  // State
  images: ImageItem[];
  globalSettings: Partial<ProcessOptions>;
  isProcessing: boolean;
  totalProgress: number;

  // Image Actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  updateImageOptions: (id: string, options: Partial<ProcessOptions>) => void;
  setImageStatus: (id: string, status: ImageStatus) => void;
  setProcessedImage: (id: string, blob: Blob, size: number) => void;
  updateGlobalSettings: (settings: Partial<ProcessOptions>) => void;
  clearAll: () => void;
  getImage: (id: string) => ImageItem | undefined;
}

// Default process options
const defaultProcessOptions: ProcessOptions = {
  format: 'webp',
  quality: 80,
  maintainAspectRatio: true,
  scale: 100,
  resizeMode: 'fit',
};

// Helper to generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to create image preview from file
const createPreview = (file: File): string => {
  return URL.createObjectURL(file);
};

export const useImageStore = create<ImageStore>()(
  persist(
    (set, get) => ({
      // Initial state
      images: [],
      globalSettings: {},
      isProcessing: false,
      totalProgress: 0,

      // Add images to the store
      addImages: (files: File[]) => {
        const newImages: ImageItem[] = files.map((file) => ({
          id: generateId(),
          file,
          preview: createPreview(file),
          originalSize: file.size,
          options: {
            ...defaultProcessOptions,
            ...get().globalSettings,
          },
          status: 'pending' as ImageStatus,
        }));

        set((state) => ({
          images: [...state.images, ...newImages],
        }));
      },

      // Remove image by ID
      removeImage: (id: string) => {
        set((state) => {
          const image = state.images.find((img) => img.id === id);
          if (image?.preview) {
            URL.revokeObjectURL(image.preview);
          }
          return {
            images: state.images.filter((img) => img.id !== id),
          };
        });
      },

      // Update options for specific image
      updateImageOptions: (id: string, options: Partial<ProcessOptions>) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id
              ? { ...img, options: { ...img.options, ...options } }
              : img
          ),
        }));
      },

      // Update processing status
      setImageStatus: (id: string, status: ImageStatus) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, status } : img
          ),
        }));
      },

      // Set processed image result
      setProcessedImage: (id: string, blob: Blob, size: number) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id
              ? {
                  ...img,
                  processedBlob: blob,
                  processedSize: size,
                  status: 'done' as ImageStatus,
                }
              : img
          ),
        }));
      },

      // Update global settings
      updateGlobalSettings: (settings: Partial<ProcessOptions>) => {
        set((state) => ({
          globalSettings: { ...state.globalSettings, ...settings },
        }));
      },

      // Clear all images
      clearAll: () => {
        set((state) => {
          // Revoke all object URLs
          state.images.forEach((img) => {
            if (img.preview) {
              URL.revokeObjectURL(img.preview);
            }
          });
          return {
            images: [],
            totalProgress: 0,
            isProcessing: false,
          };
        });
      },

      // Get single image by ID
      getImage: (id: string) => {
        return get().images.find((img) => img.id === id);
      },
    }),
    {
      name: 'image-optimizer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        globalSettings: state.globalSettings,
        // Note: We don't persist images array because File objects
        // cannot be serialized to localStorage
      }),
    }
  )
);

// Selectors for common operations
export const selectImages = (state: ImageStore) => state.images;
export const selectImageCount = (state: ImageStore) => state.images.length;
export const selectIsProcessing = (state: ImageStore) => state.isProcessing;
export const selectTotalProgress = (state: ImageStore) => state.totalProgress;
export const selectGlobalSettings = (state: ImageStore) => state.globalSettings;
export const selectPendingImages = (state: ImageStore) =>
  state.images.filter((img) => img.status === 'pending');
export const selectProcessedImages = (state: ImageStore) =>
  state.images.filter((img) => img.status === 'done');
