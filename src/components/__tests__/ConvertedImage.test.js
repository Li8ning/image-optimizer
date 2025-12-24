import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ConvertedImage from '../ConvertedImage';

describe('ConvertedImage Component', () => {
  const mockImage = {
    name: 'converted.webp',
    preview: 'blob:http://localhost/converted',
    previewReady: true,
    size: 512,
    originalSize: 1024
  };

  const mockOnDownload = jest.fn();
  const mockOnCompare = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render converted image correctly', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    expect(screen.getByAltText('Converted WebP version of converted.webp')).toBeInTheDocument();
    expect(screen.getByLabelText('Download converted image converted.webp')).toBeInTheDocument();
    expect(screen.getByLabelText('Compare original and converted versions of converted.webp')).toBeInTheDocument();
    expect(screen.getByLabelText('Select converted.webp')).toBeInTheDocument();
  });

  it('should show preview unavailable message when preview is not available', () => {
    const imageWithoutPreview = {
      name: 'converted.webp',
      preview: null,
      previewReady: false,
      size: 512,
      originalSize: 1024
    };

    render(
      <ConvertedImage
        image={imageWithoutPreview}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    expect(screen.getByText('Preview unavailable')).toBeInTheDocument();
  });

  it('should handle download button click', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const downloadButton = screen.getByLabelText('Download converted image converted.webp');
    fireEvent.click(downloadButton);

    expect(mockOnDownload).toHaveBeenCalledWith('converted.webp');
  });

  it('should handle compare button click', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const compareButton = screen.getByLabelText('Compare original and converted versions of converted.webp');
    fireEvent.click(compareButton);

    expect(mockOnCompare).toHaveBeenCalledWith(mockImage);
  });

  it('should handle selection checkbox', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const checkbox = screen.getByLabelText('Select converted.webp');
    fireEvent.click(checkbox);

    expect(mockOnSelect).toHaveBeenCalledWith('converted.webp');
  });

  it('should show deselect label when image is selected', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={true}
      />
    );

    expect(screen.getByLabelText('Deselect converted.webp')).toBeInTheDocument();
  });

  it('should handle keyboard events for download button', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const downloadButton = screen.getByLabelText('Download converted image converted.webp');

    fireEvent.keyDown(downloadButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnDownload).toHaveBeenCalledWith('converted.webp');

    fireEvent.keyDown(downloadButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnDownload).toHaveBeenCalledWith('converted.webp');
  });

  it('should handle keyboard events for compare button', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const compareButton = screen.getByLabelText('Compare original and converted versions of converted.webp');

    fireEvent.keyDown(compareButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnCompare).toHaveBeenCalledWith(mockImage);

    fireEvent.keyDown(compareButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnCompare).toHaveBeenCalledWith(mockImage);
  });

  it('should handle keyboard events for selection checkbox', () => {
    render(
      <ConvertedImage
        image={mockImage}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const checkbox = screen.getByLabelText('Select converted.webp');

    fireEvent.keyDown(checkbox, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnSelect).toHaveBeenCalledWith('converted.webp');

    fireEvent.keyDown(checkbox, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnSelect).toHaveBeenCalledWith('converted.webp');
  });

  it('should handle image loading errors gracefully', () => {
    const mockImageWithError = {
      name: 'error.webp',
      preview: 'blob:http://localhost/error',
      previewReady: true,
      size: 512,
      originalSize: 1024
    };

    // Mock console.error to suppress errors
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <ConvertedImage
        image={mockImageWithError}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const img = screen.getByAltText('Converted WebP version of error.webp');
    fireEvent.error(img);

    expect(console.error).toHaveBeenCalled();

    console.error = originalError;
  });

  it('should handle image load success', () => {
    const mockImageWithSuccess = {
      name: 'success.webp',
      preview: 'blob:http://localhost/success',
      previewReady: true,
      size: 512,
      originalSize: 1024
    };

    // Mock console.log to suppress logs
    const originalLog = console.log;
    console.log = jest.fn();

    render(
      <ConvertedImage
        image={mockImageWithSuccess}
        onDownload={mockOnDownload}
        onCompare={mockOnCompare}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const img = screen.getByAltText('Converted WebP version of success.webp');
    fireEvent.load(img);

    expect(console.log).toHaveBeenCalled();

    console.log = originalLog;
  });
});