import ZipService from '../zipService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

describe('ZipService', () => {
  // Mock dependencies
  const originalJSZip = JSZip;
  const originalSaveAs = saveAs;
  
  beforeEach(() => {
    // Mock JSZip
    global.JSZip = jest.fn(() => ({
      file: jest.fn(),
      generateAsync: jest.fn(() => Promise.resolve(new Blob(['test'], { type: 'application/zip' })))
    }));
    
    // Mock saveAs
    global.saveAs = jest.fn();
    
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.JSZip = originalJSZip;
    global.saveAs = originalSaveAs;
  });

  describe('createAndDownloadZip', () => {
    it('should create and download ZIP file successfully', async () => {
      const mockImages = [
        { name: 'test1.webp', url: 'http://localhost:3001/download/test1.webp' },
        { name: 'test2.webp', url: 'http://localhost:3001/download/test2.webp' }
      ];

      // Mock fetch to return blob
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image-data'], { type: 'image/webp' }))
        })
      );

      const result = await ZipService.createAndDownloadZip(mockImages, 'test_zip');
      
      expect(result.success).toBe(true);
      expect(result.totalImages).toBe(2);
      expect(result.successfulImages).toBe(2);
      expect(result.failedImages).toHaveLength(0);
      expect(saveAs).toHaveBeenCalled();
    });

    it('should handle image fetch failures gracefully', async () => {
      const mockImages = [
        { name: 'test1.webp', url: 'http://localhost:3001/download/test1.webp' },
        { name: 'test2.webp', url: 'http://localhost:3001/download/test2.webp' }
      ];

      // Mock fetch to fail for second image
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('Failed to fetch image'));
        }
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image-data'], { type: 'image/webp' }))
        });
      });

      const result = await ZipService.createAndDownloadZip(mockImages, 'test_zip');
      
      expect(result.success).toBe(true);
      expect(result.totalImages).toBe(2);
      expect(result.successfulImages).toBe(1);
      expect(result.failedImages).toHaveLength(1);
      expect(result.failedImages[0].name).toBe('test2.webp');
    });

    it('should handle ZIP generation errors', async () => {
      const mockImages = [
        { name: 'test1.webp', url: 'http://localhost:3001/download/test1.webp' }
      ];

      // Mock fetch to succeed but ZIP generation to fail
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image-data'], { type: 'image/webp' }))
        })
      );

      // Mock JSZip to throw error during generation
      global.JSZip = jest.fn(() => ({
        file: jest.fn(),
        generateAsync: jest.fn(() => Promise.reject(new Error('ZIP generation failed')))
      }));

      await expect(ZipService.createAndDownloadZip(mockImages, 'test_zip'))
        .rejects
        .toThrow('Failed to create ZIP file: ZIP generation failed');
    });
  });

  describe('fetchImageBlob', () => {
    it('should fetch image blob successfully', async () => {
      const mockBlob = new Blob(['image-data'], { type: 'image/webp' });
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockBlob)
        })
      );

      const result = await ZipService.fetchImageBlob('http://localhost:3001/download/test.webp');
      expect(result).toEqual(mockBlob);
    });

    it('should handle fetch errors', async () => {
      global.fetch = jest.fn(() => 
        Promise.reject(new Error('Failed to fetch image'))
      );

      await expect(ZipService.fetchImageBlob('http://localhost:3001/download/test.webp'))
        .rejects
        .toThrow('Failed to fetch image');
    });

    it('should handle non-ok responses', async () => {
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })
      );

      await expect(ZipService.fetchImageBlob('http://localhost:3001/download/test.webp'))
        .rejects
        .toThrow('Failed to fetch image: 404 Not Found');
    });
  });

  describe('createZipFromUrls', () => {
    it('should create ZIP from URLs successfully', async () => {
      const imageUrls = [
        'http://localhost:3001/download/test1.webp',
        'http://localhost:3001/download/test2.webp'
      ];
      const filenames = ['image1.webp', 'image2.webp'];

      // Mock fetch to return blob
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image-data'], { type: 'image/webp' }))
        })
      );

      const result = await ZipService.createZipFromUrls(imageUrls, filenames, 'url_zip');
      
      expect(result.success).toBe(true);
      expect(result.totalImages).toBe(2);
      expect(result.successfulImages).toBe(2);
      expect(result.failedImages).toHaveLength(0);
      expect(saveAs).toHaveBeenCalled();
    });

    it('should handle partial failures in URL processing', async () => {
      const imageUrls = [
        'http://localhost:3001/download/test1.webp',
        'http://localhost:3001/download/test2.webp'
      ];
      const filenames = ['image1.webp', 'image2.webp'];

      // Mock fetch to fail for second URL
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('Failed to fetch image'));
        }
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image-data'], { type: 'image/webp' }))
        });
      });

      const result = await ZipService.createZipFromUrls(imageUrls, filenames, 'url_zip');
      
      expect(result.success).toBe(true);
      expect(result.totalImages).toBe(2);
      expect(result.successfulImages).toBe(1);
      expect(result.failedImages).toHaveLength(1);
    });
  });
});