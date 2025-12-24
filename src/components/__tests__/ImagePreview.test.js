import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ImagePreview from '../ImagePreview';

describe('ImagePreview Component', () => {
  const mockFile = {
    name: 'test.jpg',
    type: 'image/jpeg',
    size: 1024,
    preview: 'blob:http://localhost/test',
    previewReady: true
  };

  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render image preview correctly', () => {
    render(<ImagePreview file={mockFile} index={0} onRemove={mockOnRemove} />);

    expect(screen.getByAltText('Preview of test.jpg')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove test.jpg')).toBeInTheDocument();
  });

  it('should show preview unavailable message when preview is not available', () => {
    const fileWithoutPreview = {
      name: 'test.jpg',
      type: 'image/jpeg',
      size: 1024,
      preview: null,
      previewReady: false
    };

    render(<ImagePreview file={fileWithoutPreview} index={0} onRemove={mockOnRemove} />);

    expect(screen.getByText('Preview unavailable')).toBeInTheDocument();
  });

  it('should handle remove button click', () => {
    render(<ImagePreview file={mockFile} index={0} onRemove={mockOnRemove} />);
    const removeButton = screen.getByLabelText('Remove test.jpg');

    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  it('should handle remove button keyboard events', () => {
    render(<ImagePreview file={mockFile} index={0} onRemove={mockOnRemove} />);
    const removeButton = screen.getByLabelText('Remove test.jpg');

    fireEvent.keyDown(removeButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnRemove).toHaveBeenCalledWith(0);

    fireEvent.keyDown(removeButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  it('should format file sizes correctly', () => {
    const largeFile = {
      name: 'large.jpg',
      type: 'image/jpeg',
      size: 1048576,
      preview: 'blob:http://localhost/test',
      previewReady: true
    };

    render(<ImagePreview file={largeFile} index={0} onRemove={mockOnRemove} />);

    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });

  it('should handle image loading errors gracefully', () => {
    const mockFileWithError = {
      name: 'error.jpg',
      type: 'image/jpeg',
      size: 1024,
      preview: 'blob:http://localhost/error',
      previewReady: true
    };

    // Mock console.error to suppress errors
    const originalError = console.error;
    console.error = jest.fn();

    render(<ImagePreview file={mockFileWithError} index={0} onRemove={mockOnRemove} />);

    const img = screen.getByAltText('Preview of error.jpg');
    fireEvent.error(img);

    expect(console.error).toHaveBeenCalled();

    console.error = originalError;
  });

  it('should handle image load success', () => {
    const mockFileWithSuccess = {
      name: 'success.jpg',
      type: 'image/jpeg',
      size: 1024,
      preview: 'blob:http://localhost/success',
      previewReady: true
    };

    // Mock console.log to suppress logs
    const originalLog = console.log;
    console.log = jest.fn();

    render(<ImagePreview file={mockFileWithSuccess} index={0} onRemove={mockOnRemove} />);

    const img = screen.getByAltText('Preview of success.jpg');
    fireEvent.load(img);

    expect(console.log).toHaveBeenCalled();

    console.log = originalLog;
  });
});