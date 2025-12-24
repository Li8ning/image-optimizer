import ApiService from '../apiService';
import { toast } from 'react-toastify';

describe('ApiService', () => {
  // Mock toast notifications
  const originalToast = toast;
  
  beforeEach(() => {
    toast.success = jest.fn();
    toast.error = jest.fn();
    toast.info = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    toast.success = originalToast.success;
    toast.error = originalToast.error;
    toast.info = originalToast.info;
  });

  describe('convertImages', () => {
    const mockImages = [
      { name: 'test1.jpg', type: 'image/jpeg', preview: 'blob:http://localhost/test1' },
      { name: 'test2.png', type: 'image/png', preview: 'blob:http://localhost/test2' }
    ];

    it('should handle successful image conversion', async () => {
      // Mock fetch for blob conversion
      global.fetch = jest.fn((url) => {
        if (url.startsWith('blob:')) {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))
          });
        }
        // Mock the actual API call
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      const result = await ApiService.convertImages(mockImages, 800, 80);
      expect(result).toEqual({ success: true });
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = jest.fn(() => 
        Promise.reject(new Error('Network error: Could not connect to the conversion server'))
      );

      await expect(ApiService.convertImages(mockImages, 800, 80))
        .rejects
        .toThrow('Network error: Could not connect to the conversion server');
    });

    it('should handle server errors gracefully', async () => {
      global.fetch = jest.fn((url) => {
        if (url.startsWith('blob:')) {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))
          });
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });
      });

      await expect(ApiService.convertImages(mockImages, 800, 80))
        .rejects
        .toThrow('Server error: 500 Internal Server Error');
    });

    it('should handle file preparation errors', async () => {
      global.fetch = jest.fn((url) => {
        if (url.startsWith('blob:')) {
          return Promise.reject(new Error('Failed to fetch blob'));
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      // Mock console.error to suppress errors
      const originalError = console.error;
      console.error = jest.fn();

      await ApiService.convertImages(mockImages, 800, 80);
      expect(toast.error).toHaveBeenCalled();

      console.error = originalError;
    });
  });

  describe('downloadConvertedImage', () => {
    it('should redirect to download URL', () => {
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      ApiService.downloadConvertedImage('test.webp');
      expect(window.location.href).toBe('http://localhost:3001/download/test.webp');

      window.location = originalLocation;
    });
  });

  describe('fetchConvertedImage', () => {
    it('should fetch converted image successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/webp' });
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockBlob)
        })
      );

      const result = await ApiService.fetchConvertedImage('/download/test.webp');
      expect(result).toEqual(mockBlob);
    });

    it('should handle fetch errors', async () => {
      global.fetch = jest.fn(() => 
        Promise.reject(new Error('Failed to fetch converted image'))
      );

      await expect(ApiService.fetchConvertedImage('/download/test.webp'))
        .rejects
        .toThrow('Failed to fetch converted image');
    });
  });

  describe('testMemoryCleanup', () => {
    it('should log memory cleanup test messages', () => {
      const originalLog = console.log;
      const originalInfo = toast.info;
      console.log = jest.fn();
      toast.info = jest.fn();

      ApiService.testMemoryCleanup();
      expect(console.log).toHaveBeenCalledWith('Testing memory cleanup...');
      expect(console.log).toHaveBeenCalledWith('Memory cleanup test completed');
      expect(toast.info).toHaveBeenCalledWith('🧪 Memory cleanup test completed - check console for details');

      console.log = originalLog;
      toast.info = originalInfo;
    });
  });
});