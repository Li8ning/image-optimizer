// Jest setup file for React Testing Library
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({ testIdAttribute: 'data-testid' });

// Mock matchMedia for window
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
});

// Mock ResizeObserver for components that might use it
window.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Mock observe method
  }
  unobserve() {
    // Mock unobserve method
  }
  disconnect() {
    // Mock disconnect method
  }
};

// Mock console.error to suppress React 18 warnings during tests
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: ReactDOM.render is no longer supported in React 18./.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock toast notifications
const mockToast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

// Mock file utilities for testing
const mockCreateObjectURL = () => 'mock-url';
const mockRevokeObjectURL = () => {};

// Export mocks for testing
export { mockToast, mockCreateObjectURL, mockRevokeObjectURL };