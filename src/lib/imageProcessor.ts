import type { ImageFormat, ProcessOptions } from '../types/image';

// @jsquash decoders and encoders - import from specific modules
import { init as initAvifEncode, default as encodeAvif } from '@jsquash/avif/encode.js';
import { init as initAvifDecode, default as decodeAvif } from '@jsquash/avif/decode.js';
import { init as initJpegEncode, default as encodeJpeg } from '@jsquash/jpeg/encode.js';
import { init as initJpegDecode, default as decodeJpeg } from '@jsquash/jpeg/decode.js';
import { init as initPngEncode, default as encodePng } from '@jsquash/png/encode.js';
import { init as initPngDecode, default as decodePng } from '@jsquash/png/decode.js';
import { init as initWebpEncode, default as encodeWebp } from '@jsquash/webp/encode.js';
import { init as initWebpDecode, default as decodeWebp } from '@jsquash/webp/decode.js';
import { initResize, default as resizeImage } from '@jsquash/resize';

// MIME type mapping for decoders
const MIME_TYPE_MAP: Record<string, string> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// WASM initialization state
let wasmInitialized = false;
let wasmInitializing = false;
let wasmInitPromise: Promise<void> | null = null;

/**
 * Initialize WASM modules with lazy loading
 * @returns Promise that resolves when WASM is initialized
 */
export async function initWasm(): Promise<void> {
  if (wasmInitialized) return;
  if (wasmInitializing && wasmInitPromise) return wasmInitPromise;

  wasmInitializing = true;
  wasmInitPromise = (async () => {
    try {
      // Initialize all WASM modules
      await Promise.all([
        initAvifEncode(),
        initAvifDecode(),
        initJpegEncode(),
        initJpegDecode(),
        initPngEncode(),
        initPngDecode(),
        initWebpEncode(),
        initWebpDecode(),
        initResize(),
      ]);
      wasmInitialized = true;
    } catch (error) {
      wasmInitializing = false;
      wasmInitPromise = null;
      throw new Error(`Failed to initialize WASM modules: ${error}`);
    }
  })();

  return wasmInitPromise;
}

/**
 * Check if WASM is initialized
 */
export function isWasmReady(): boolean {
  return wasmInitialized;
}

/**
 * Read file as ArrayBuffer
 * @param file - Image file
 * @returns Promise resolving to ArrayBuffer
 */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Detect image format from File or MIME type
 * @param file - Image file
 * @returns Detected format string
 */
export function detectImageFormat(file: File): string {
  const mimeType = file.type.toLowerCase();
  const format = MIME_TYPE_MAP[mimeType];
  if (format) return format;
  
  // Try to detect from extension if MIME type is unknown
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg') return 'jpeg';
  if (['avif', 'jpeg', 'png', 'webp'].includes(ext || '')) {
    return ext || '';
  }
  throw new Error(`Unsupported image format: ${file.type}`);
}

/**
 * Decode an image file to ImageData
 * @param file - Image file to decode
 * @returns Promise resolving to ImageData
 */
export async function decodeImage(file: File): Promise<ImageData> {
  await initWasm();
  
  const format = detectImageFormat(file);
  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  try {
    let imageData: ImageData | null = null;
    
    switch (format) {
      case 'avif':
        imageData = await decodeAvif(arrayBuffer);
        break;
      case 'jpeg':
        imageData = await decodeJpeg(arrayBuffer);
        break;
      case 'png':
        imageData = await decodePng(arrayBuffer);
        break;
      case 'webp':
        imageData = await decodeWebp(arrayBuffer);
        break;
      default:
        throw new Error(`Unsupported image format: ${format}`);
    }
    
    if (!imageData) {
      throw new Error('Decoder returned null');
    }
    return imageData;
  } catch (error) {
    throw new Error(`Failed to decode image: ${file.name}. ${error}`);
  }
}

/**
 * Encode ImageData to a specific format
 * @param imageData - ImageData to encode
 * @param format - Target format
 * @param quality - Quality parameter (0-100)
 * @returns Promise resolving to Blob
 */
export async function encodeImage(
  imageData: ImageData,
  format: ImageFormat,
  quality: number = 80
): Promise<Blob> {
  await initWasm();
  
  try {
    let arrayBuffer: ArrayBuffer;
    
    switch (format) {
      case 'avif': {
        // AVIF: quality (0-63 in @jsquash, lower is better quality)
        const avifQuality = Math.round(64 - (quality * 0.64));
        const q = Math.max(0, Math.min(63, avifQuality));
        arrayBuffer = await encodeAvif(imageData, { quality: q });
        break;
      }
      case 'jpeg': {
        // JPEG: quality (0-100)
        arrayBuffer = await encodeJpeg(imageData, { quality });
        break;
      }
      case 'png': {
        // PNG: lossless, no quality parameter
        arrayBuffer = await encodePng(imageData);
        break;
      }
      case 'webp': {
        // WebP: quality (0-100)
        arrayBuffer = await encodeWebp(imageData, { quality });
        break;
      }
      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
    
    const mimeType = `image/${format}`;
    return new Blob([arrayBuffer], { type: mimeType });
  } catch (error) {
    throw new Error(`Failed to encode image to ${format}: ${error}`);
  }
}

/**
 * Resize ImageData to specified dimensions
 * @param imageData - ImageData to resize
 * @param width - Target width
 * @param height - Target height
 * @returns Promise resolving to resized ImageData
 */
export async function resizeImageData(
  imageData: ImageData,
  width: number,
  height: number
): Promise<ImageData> {
  await initWasm();
  
  // Ensure dimensions are valid
  const targetWidth = Math.max(1, Math.round(width));
  const targetHeight = Math.max(1, Math.round(height));
  
  try {
    const resizedData = await resizeImage(imageData, {
      width: targetWidth,
      height: targetHeight,
    });
    return resizedData;
  } catch (error) {
    throw new Error(`Failed to resize image: ${error}`);
  }
}

/**
 * Calculate new dimensions maintaining aspect ratio
 * @param originalWidth - Original width
 * @param originalHeight - Original height
 * @param targetWidth - Target width (optional)
 * @param targetHeight - Target height (optional)
 * @returns New dimensions or null if neither target is specified
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } | null {
  if (!targetWidth && !targetHeight) return null;
  
  const aspectRatio = originalWidth / originalHeight;
  
  if (targetWidth && targetHeight) {
    // Both specified, use whichever produces smaller dimensions to fit
    const widthByTargetWidth = targetWidth;
    const heightByTargetWidth = targetWidth / aspectRatio;
    const widthByTargetHeight = targetHeight * aspectRatio;
    const heightByTargetHeight = targetHeight;
    
    return {
      width: Math.round(Math.min(widthByTargetWidth, widthByTargetHeight)),
      height: Math.round(Math.min(heightByTargetWidth, heightByTargetHeight)),
    };
  }
  
  if (targetWidth) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  }
  
  if (targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  }
  
  return null;
}

/**
 * Process an image with specified options
 * @param file - Image file to process
 * @param options - Processing options
 * @returns Promise resolving to processed Blob
 */
export async function processImage(
  file: File,
  options: ProcessOptions
): Promise<Blob> {
  await initWasm();
  
  const startTime = performance.now();
  
  try {
    // Step 1: Decode the image
    let imageData = await decodeImage(file);
    
    // Step 2: Resize if dimensions are specified
    if (options.width || options.height) {
      let targetDimensions: { width: number; height: number } | null = null;
      
      if (options.maintainAspectRatio) {
        targetDimensions = calculateAspectRatioDimensions(
          imageData.width,
          imageData.height,
          options.width,
          options.height
        );
      } else {
        targetDimensions = {
          width: options.width || imageData.width,
          height: options.height || imageData.height,
        };
      }
      
      if (targetDimensions) {
        imageData = await resizeImageData(
          imageData,
          targetDimensions.width,
          targetDimensions.height
        );
      }
    }
    
    // Step 3: Encode to target format
    const quality = options.quality ?? 80;
    const blob = await encodeImage(imageData, options.format, quality);
    
    const endTime = performance.now();
    console.log(`Processed ${file.name} in ${(endTime - startTime).toFixed(2)}ms`);
    
    return blob;
  } catch (error) {
    throw new Error(`Failed to process image ${file.name}: ${error}`);
  }
}

/**
 * Get format-specific encoder options for display
 */
export function getFormatOptions(format: ImageFormat): { quality: boolean; progressive: boolean; speed: boolean } {
  switch (format) {
    case 'avif':
      return { quality: true, progressive: false, speed: true };
    case 'jpeg':
      return { quality: true, progressive: true, speed: false };
    case 'png':
      return { quality: false, progressive: false, speed: false };
    case 'webp':
      return { quality: true, progressive: false, speed: false };
    default:
      return { quality: false, progressive: false, speed: false };
  }
}

/**
 * Get default quality for a format
 */
export function getDefaultQuality(format: ImageFormat): number {
  switch (format) {
    case 'avif':
      return 75;
    case 'jpeg':
      return 85;
    case 'png':
      return 100;
    case 'webp':
      return 80;
    default:
      return 80;
  }
}
