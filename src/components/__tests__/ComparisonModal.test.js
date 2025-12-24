import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ComparisonModal from '../ComparisonModal';

describe('ComparisonModal Component', () => {
  const mockOriginalImage = {
    name: 'original.jpg',
    type: 'image/jpeg',
    size: 1024,
    preview: 'blob:http://localhost/original'
  };

  const mockConvertedImage = {
    name: 'converted.webp',
    type: 'image/webp',
    size: 512,
    preview: 'blob:http://localhost/converted',
    previewReady: true
  };

  const mockOnClose = jest.fn();
  const mockOnPrevious = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when show is false', () => {
    const { container } = render(
      <ComparisonModal
        show={false}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render modal when show is true', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    expect(screen.getByText('Image Comparison')).toBeInTheDocument();
    expect(screen.getByLabelText('Close comparison modal')).toBeInTheDocument();
  });

  it('should display original and converted image information', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    expect(screen.getByText('Original Image')).toBeInTheDocument();
    expect(screen.getByText('Converted WebP')).toBeInTheDocument();
    expect(screen.getByText('Name: original.jpg')).toBeInTheDocument();
    expect(screen.getByText('Name: converted.webp')).toBeInTheDocument();
  });

  it('should display comparison metrics', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    expect(screen.getByText('Comparison Metrics')).toBeInTheDocument();
    expect(screen.getByText('File Size Reduction')).toBeInTheDocument();
    expect(screen.getByText('Bytes Saved')).toBeInTheDocument();
    expect(screen.getByText('Compression Ratio')).toBeInTheDocument();
  });

  it('should handle close button click', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    const closeButton = screen.getByLabelText('Close comparison modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle close button keyboard events', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    const closeButton = screen.getByLabelText('Close comparison modal');

    fireEvent.keyDown(closeButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnClose).toHaveBeenCalled();

    fireEvent.keyDown(closeButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnClose).toHaveBeenCalled();

    fireEvent.keyDown(closeButton, { key: 'Escape', preventDefault: jest.fn() });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle previous button click', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    const previousButton = screen.getByLabelText('View previous image comparison');
    fireEvent.click(previousButton);

    expect(mockOnPrevious).toHaveBeenCalled();
  });

  it('should handle next button click', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    const nextButton = screen.getByLabelText('View next image comparison');
    fireEvent.click(nextButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should disable previous button when hasPrevious is false', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={false}
        hasNext={true}
      />
    );

    const previousButton = screen.getByLabelText('View previous image comparison');
    expect(previousButton).toHaveAttribute('aria-disabled', 'false');
    expect(previousButton).toHaveAttribute('tabIndex', '-1');
  });

  it('should disable next button when hasNext is false', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={false}
      />
    );

    const nextButton = screen.getByLabelText('View next image comparison');
    expect(nextButton).toHaveAttribute('aria-disabled', 'false');
    expect(nextButton).toHaveAttribute('tabIndex', '-1');
  });

  it('should show converted image preview unavailable when preview is not ready', () => {
    const convertedImageWithoutPreview = {
      name: 'converted.webp',
      type: 'image/webp',
      size: 512,
      preview: null,
      previewReady: false
    };

    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={convertedImageWithoutPreview}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    expect(screen.getByText('Converted image preview unavailable')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ComparisonModal
        show={true}
        originalImage={mockOriginalImage}
        convertedImage={mockConvertedImage}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={true}
        hasNext={true}
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'comparison-title');

    const document = screen.getByRole('document');
    expect(document).toBeInTheDocument();
  });
});