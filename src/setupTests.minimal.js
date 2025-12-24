// Minimal Jest setup file
import '@testing-library/jest-dom';

// Mock console.error to suppress React 18 warnings during tests
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: ReactDOM.render is no longer supported in React 18./.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock browser APIs for Node.js environment
global.FormData = class FormData {
  constructor() {
    this.data = {};
  }
  
  append(name, value, filename) {
    this.data[name] = { value, filename };
  }
};

global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
    this.size = parts.reduce((total, part) => total + (part?.length || 0), 0);
    this.type = options?.type || '';
  }
};

global.File = class File extends Blob {
  constructor(parts, filename, options) {
    super(parts, options);
    this.name = filename;
    this.lastModified = Date.now();
  }
};

global.window = {
  location: {
    href: ''
  }
};

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock file utilities for testing
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();