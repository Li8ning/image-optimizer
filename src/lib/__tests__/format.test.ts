import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  getFileExtension,
  calculateAspectRatio,
  getMimeType,
  formatQuality,
  formatDuration,
  getPresetName,
  calculateNewDimensions,
} from '../format';

describe('format.ts', () => {
  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes to Bytes', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format bytes to KB', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format bytes to MB', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });

    it('should format bytes to GB', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB');
    });

    it('should respect decimal places', () => {
      expect(formatBytes(1500, 0)).toBe('1 KB');
      expect(formatBytes(1500, 3)).toBe('1.465 KB');
    });
  });

  describe('getFileExtension', () => {
    it('should return correct extension for webp', () => {
      expect(getFileExtension('webp')).toBe('.webp');
    });

    it('should return correct extension for jpeg', () => {
      expect(getFileExtension('jpeg')).toBe('.jpg');
    });

    it('should return correct extension for png', () => {
      expect(getFileExtension('png')).toBe('.png');
    });

    it('should return correct extension for avif', () => {
      expect(getFileExtension('avif')).toBe('.avif');
    });
  });

  describe('calculateAspectRatio', () => {
    it('should calculate 16:9 aspect ratio', () => {
      expect(calculateAspectRatio(1920, 1080)).toBe('16:9');
    });

    it('should calculate 4:3 aspect ratio', () => {
      expect(calculateAspectRatio(1600, 1200)).toBe('4:3');
    });

    it('should calculate 1:1 aspect ratio for square', () => {
      expect(calculateAspectRatio(100, 100)).toBe('1:1');
    });

    it('should calculate 21:9 aspect ratio', () => {
      expect(calculateAspectRatio(2100, 900)).toBe('7:3');
    });

    it('should handle prime numbers', () => {
      expect(calculateAspectRatio(17, 13)).toBe('17:13');
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME type for webp', () => {
      expect(getMimeType('webp')).toBe('image/webp');
    });

    it('should return correct MIME type for jpeg', () => {
      expect(getMimeType('jpeg')).toBe('image/jpeg');
    });

    it('should return correct MIME type for png', () => {
      expect(getMimeType('png')).toBe('image/png');
    });

    it('should return correct MIME type for avif', () => {
      expect(getMimeType('avif')).toBe('image/avif');
    });
  });

  describe('formatQuality', () => {
    it('should format quality as percentage', () => {
      expect(formatQuality(80)).toBe('80%');
      expect(formatQuality(100)).toBe('100%');
      expect(formatQuality(0)).toBe('0%');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(59999)).toBe('60s');
    });

    it('should format minutes', () => {
      expect(formatDuration(60000)).toBe('1m 0s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(125000)).toBe('2m 5s');
    });
  });

  describe('getPresetName', () => {
    it('should return correct name for web preset', () => {
      expect(getPresetName('web')).toBe('Web Optimized');
    });

    it('should return correct name for photo preset', () => {
      expect(getPresetName('photo')).toBe('Photo Quality');
    });

    it('should return correct name for lossless preset', () => {
      expect(getPresetName('lossless')).toBe('Lossless');
    });

    it('should return Custom for undefined preset', () => {
      expect(getPresetName(undefined)).toBe('Custom');
    });
  });

  describe('calculateNewDimensions', () => {
    it('should maintain aspect ratio when width is constrained', () => {
      const result = calculateNewDimensions(1920, 1080, 800, 1200);
      expect(result.width).toBe(800);
      expect(result.height).toBe(450);
    });

    it('should maintain aspect ratio when height is constrained', () => {
      const result = calculateNewDimensions(1920, 1080, 2400, 400);
      expect(result.width).toBe(711);
      expect(result.height).toBe(400);
    });

    it('should handle square images', () => {
      const result = calculateNewDimensions(100, 100, 50, 50);
      expect(result.width).toBe(50);
      expect(result.height).toBe(50);
    });

    it('should handle portrait images', () => {
      const result = calculateNewDimensions(800, 1200, 400, 400);
      expect(result.width).toBe(267);
      expect(result.height).toBe(400);
    });
  });
});
