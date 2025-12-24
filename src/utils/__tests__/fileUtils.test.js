import { 
  validateFiles, 
  formatFileSize, 
  calculateSizeSavings, 
  cleanupObjectURLs, 
  createTrackedObjectURL, 
  createFileWithPreview, 
  MAX_FILE_SIZE, 
  ALLOWED_FILE_TYPES 
} from '../fileUtils';

describe('File Utility Functions', () => {
  describe('validateFiles', () => {
    it('should validate valid image files', () => {
      const mockFiles = [
        { name: 'test.jpg', type: 'image/jpeg', size: 1000 },
        { name: 'test.png', type: 'image/png', size: 2000 }
      ];
      
      const result = validateFiles(mockFiles);
      expect(result.validFiles).toHaveLength(2);
      expect(result.validationErrors).toHaveLength(0);
    });

    it('should reject files with invalid types', () => {
      const mockFiles = [
        { name: 'test.txt', type: 'text/plain', size: 1000 },
        { name: 'test.pdf', type: 'application/pdf', size: 2000 }
      ];
      
      const result = validateFiles(mockFiles);
      expect(result.validFiles).toHaveLength(0);
      expect(result.validationErrors).toHaveLength(2);
      expect(result.validationErrors[0].errorType).toBe('invalid_type');
    });

    it('should reject files that exceed size limit', () => {
      const largeFile = { 
        name: 'large.jpg', 
        type: 'image/jpeg', 
        size: MAX_FILE_SIZE + 1000 
      };
      
      const result = validateFiles([largeFile]);
      expect(result.validFiles).toHaveLength(0);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors[0].errorType).toBe('size_limit');
    });

    it('should reject non-image files', () => {
      const mockFile = { 
        name: 'test.txt', 
        type: 'text/plain', 
        size: 1000 
      };
      
      const result = validateFiles([mockFile]);
      expect(result.validFiles).toHaveLength(0);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors[0].errorType).toBe('invalid_type');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should handle large file sizes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1500000000)).toBe('1.4 GB');
    });
  });

  describe('calculateSizeSavings', () => {
    it('should calculate size savings correctly', () => {
      expect(calculateSizeSavings(1000, 500)).toBe('50.0');
      expect(calculateSizeSavings(2000, 1000)).toBe('50.0');
      expect(calculateSizeSavings(1000, 900)).toBe('10.0');
      expect(calculateSizeSavings(1000, 0)).toBe('100.0');
    });

    it('should return 0.0 for invalid inputs', () => {
      expect(calculateSizeSavings(0, 100)).toBe('0.0');
      expect(calculateSizeSavings(null, 100)).toBe('0.0');
      expect(calculateSizeSavings(100, null)).toBe('100.0'); // When convertedSize is null, it's treated as 0
      expect(calculateSizeSavings(-100, 50)).toBe('0.0');
    });
  });

  describe('cleanupObjectURLs', () => {
    const originalRevokeObjectURL = URL.revokeObjectURL;

    beforeEach(() => {
      URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('should revoke object URLs for blob URLs', () => {
      const mockUrls = ['blob:http://localhost/test1', 'blob:http://localhost/test2'];
      cleanupObjectURLs(mockUrls);
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });

    it('should not revoke non-blob URLs', () => {
      const mockUrls = ['http://localhost/test1', 'https://example.com/test2'];
      cleanupObjectURLs(mockUrls);
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });

    it('should handle empty array', () => {
      cleanupObjectURLs([]);
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });

    it('should handle non-array input', () => {
      cleanupObjectURLs('not-an-array');
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('createTrackedObjectURL', () => {
    const originalCreateObjectURL = URL.createObjectURL;

    beforeEach(() => {
      URL.createObjectURL = jest.fn(() => 'mock-url');
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
    });

    it('should create object URL for valid file', () => {
      const mockFile = { name: 'test.jpg', type: 'image/jpeg' };
      const result = createTrackedObjectURL(mockFile);
      expect(result).toBe('mock-url');
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it('should return empty string for null file', () => {
      const result = createTrackedObjectURL(null);
      expect(result).toBe('');
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      URL.createObjectURL = jest.fn(() => { throw new Error('Test error'); });
      const mockFile = { name: 'test.jpg', type: 'image/jpeg' };
      const result = createTrackedObjectURL(mockFile);
      expect(result).toBe('');
    });
  });

  describe('createFileWithPreview', () => {
    const originalCreateObjectURL = URL.createObjectURL;

    beforeEach(() => {
      URL.createObjectURL = jest.fn(() => 'mock-preview-url');
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
    });

    it('should create file with preview for valid file', () => {
      const mockFile = { 
        name: 'test.jpg', 
        type: 'image/jpeg', 
        size: 1000, 
        lastModified: Date.now()
      };
      
      const result = createFileWithPreview(mockFile);
      expect(result.fileWithPreview.preview).toBe('mock-preview-url');
      expect(result.fileWithPreview.previewReady).toBe(true);
      expect(result.fileWithPreview.name).toBe('test.jpg');
      expect(result.previewUrl).toBe('mock-preview-url');
    });

    it('should handle errors gracefully', () => {
      URL.createObjectURL = jest.fn(() => { throw new Error('Test error'); });
      const mockFile = { 
        name: 'test.jpg', 
        type: 'image/jpeg', 
        size: 1000, 
        lastModified: Date.now()
      };
      
      const result = createFileWithPreview(mockFile);
      expect(result.fileWithError.preview).toBe(null);
      expect(result.fileWithError.previewReady).toBe(false);
      expect(result.previewUrl).toBe(null);
    });
  });

  describe('Constants', () => {
    it('should have correct MAX_FILE_SIZE', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024); // 10MB
    });

    it('should have correct ALLOWED_FILE_TYPES', () => {
      expect(ALLOWED_FILE_TYPES).toEqual([
        'image/jpeg', 
        'image/png', 
        'image/webp', 
        'image/gif', 
        'image/bmp', 
        'image/tiff'
      ]);
    });
  });
});