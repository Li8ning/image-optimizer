import type { ImageItem, ProcessOptions } from '../types/image';
import { processImage, initWasm, isWasmReady } from './imageProcessor';

// Abort controller for cancellation support
const abortControllers = new Map<string, AbortController>();

/**
 * Check if processing should be aborted for a specific image
 * @param id - Image ID to check
 * @returns True if aborted
 */
function isAborted(id: string): boolean {
  const controller = abortControllers.get(id);
  return controller?.signal.aborted ?? false;
}

/**
 * Abort processing for a specific image
 * @param id - Image ID to abort
 */
export function abortProcessing(id: string): void {
  const controller = abortControllers.get(id);
  if (controller) {
    controller.abort();
    abortControllers.delete(id);
  }
}

/**
 * Abort all batch processing
 */
export function abortAllProcessing(): void {
  abortControllers.forEach((_, id) => abortProcessing(id));
}

/**
 * Process a single image item
 * @param item - Image item to process
 * @param options - Processing options
 * @param onProgress - Progress callback
 * @returns Processed image item
 */
async function processImageItem(
  item: ImageItem,
  options: ProcessOptions,
  onProgress: (id: string, progress: number) => void
): Promise<ImageItem> {
  // Create abort controller for this image
  const controller = new AbortController();
  abortControllers.set(item.id, controller);

  try {
    // Report starting
    onProgress(item.id, 0);

    // Check if aborted before starting
    if (isAborted(item.id)) {
      return { ...item, status: 'pending' as const };
    }

    // Process the image
    const processedBlob = await processImage(item.file, options);

    // Check if aborted after processing
    if (isAborted(item.id)) {
      return { ...item, status: 'pending' as const };
    }

    return {
      ...item,
      processedBlob,
      processedSize: processedBlob.size,
      status: 'done' as const,
    };
  } catch (error) {
    // Handle abort separately
    if (controller.signal.aborted) {
      return { ...item, status: 'pending' as const };
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to process image ${item.id}:`, error);
    
    return {
      ...item,
      status: 'error' as const,
      error: errorMessage,
    };
  } finally {
    // Clean up abort controller
    abortControllers.delete(item.id);
  }
}

/**
 * Process a batch of images with progress tracking
 * @param images - Array of image items to process
 * @param options - Processing options
 * @param onProgress - Progress callback (id, progress)
 * @returns Promise resolving to processed image items
 */
export async function processBatch(
  images: ImageItem[],
  options: ProcessOptions,
  onProgress: (id: string, progress: number) => void
): Promise<ImageItem[]> {
  // Ensure WASM is initialized before starting batch
  if (!isWasmReady()) {
    await initWasm();
  }

  // Abort any existing processing
  abortAllProcessing();

  const results: ImageItem[] = [];
  const total = images.length;
  let completed = 0;

  // Process images sequentially to avoid memory issues with large images
  // This also ensures stable progress reporting
  for (const image of images) {
    // Skip if already done or error (unless we want to retry)
    if (image.status === 'done' && image.processedBlob) {
      results.push(image);
      completed++;
      onProgress(image.id, 100);
      continue;
    }

    // Mark as processing
    const processingItem: ImageItem = { ...image, status: 'processing' };
    results.push(processingItem);

    // Process the image
    const processedItem = await processImageItem(image, options, onProgress);
    
    // Update the result
    const resultIndex = results.findIndex(r => r.id === image.id);
    if (resultIndex !== -1) {
      results[resultIndex] = processedItem;
    }

    completed++;
    console.log(`Batch progress: ${completed}/${total} (${Math.round((completed / total) * 100)}%)`);
  }

  return results;
}

/**
 * Process multiple images in parallel with concurrency limit
 * @param images - Array of image items to process
 * @param options - Processing options
 * @param onProgress - Progress callback (id, progress)
 * @param concurrency - Maximum concurrent processing (default: 2)
 * @returns Promise resolving to processed image items
 */
export async function processBatchParallel(
  images: ImageItem[],
  options: ProcessOptions,
  onProgress: (id: string, progress: number) => void,
  concurrency: number = 2
): Promise<ImageItem[]> {
  // Ensure WASM is initialized before starting batch
  if (!isWasmReady()) {
    await initWasm();
  }

  // Abort any existing processing
  abortAllProcessing();

  // Filter images that need processing
  const toProcess = images.filter(img => img.status !== 'done' || !img.processedBlob);
  const alreadyDone = images.filter(img => img.status === 'done' && img.processedBlob);

  const results: ImageItem[] = [...alreadyDone];
  const queue = [...toProcess];
  const completedItems: ImageItem[] = [];

  // Process with concurrency limit
  const processNext = async (): Promise<void> => {
    if (queue.length === 0) return;

    const item = queue.shift()!;
    const index = results.length;
    
    // Mark as processing
    results.push({ ...item, status: 'processing' });

    const processed = await processImageItem(item, options, onProgress);
    completedItems[index] = processed;
  };

  // Start initial batch of workers
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          await processNext();
        }
      })()
    );
  }

  await Promise.all(workers);

  // Merge results (keeping order)
  for (const item of completedItems) {
    if (item) {
      const resultIndex = results.findIndex(r => r.id === item.id);
      if (resultIndex !== -1) {
        results[resultIndex] = item;
      }
    }
  }

  return results;
}

/**
 * Retry failed images in a batch
 * @param images - Array of image items
 * @param options - Processing options
 * @param onProgress - Progress callback
 * @returns Promise resolving to processed image items
 */
export async function retryFailedImages(
  images: ImageItem[],
  options: ProcessOptions,
  onProgress: (id: string, progress: number) => void
): Promise<ImageItem[]> {
  const failedImages = images.filter(img => img.status === 'error');
  const successfulImages = images.filter(img => img.status === 'done' && img.processedBlob);

  // Only retry failed images
  const retriedResults = await processBatch(
    failedImages.map(img => ({ ...img, status: 'pending' as const, error: undefined })),
    options,
    onProgress
  );

  // Combine results
  const resultMap = new Map<string, ImageItem>();
  
  for (const img of successfulImages) {
    resultMap.set(img.id, img);
  }
  for (const img of retriedResults) {
    resultMap.set(img.id, img);
  }

  return Array.from(resultMap.values());
}

/**
 * Get the number of images currently being processed
 */
export function getActiveProcessingCount(): number {
  return abortControllers.size;
}

/**
 * Check if any batch processing is in progress
 */
export function isProcessingActive(): boolean {
  return abortControllers.size > 0;
}
