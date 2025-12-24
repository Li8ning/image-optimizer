import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import BatchOperations from '../BatchOperations';
import { toast } from 'react-toastify';

describe('BatchOperations Component', () => {
  const mockConvertedImages = [
    { name: 'image1.webp', size: 512 },
    { name: 'image2.webp', size: 768 },
    { name: 'image3.webp', size: 1024 }
  ];

  const mockSelectedImages = ['image1.webp', 'image3.webp'];

  const mockOnDownloadAll = jest.fn();
  const mockOnSelectAll = jest.fn();
  const mockOnDeselectAll = jest.fn();
  const mockOnBulkDownload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    toast.warning = jest.fn();
    toast.info = jest.fn();
  });

  it('should render batch operations correctly', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    expect(screen.getByText('Batch Operations')).toBeInTheDocument();
    expect(screen.getByLabelText('Download all converted images as ZIP')).toBeInTheDocument();
    expect(screen.getByLabelText('Select all converted images')).toBeInTheDocument();
    expect(screen.getByLabelText('Deselect all images')).toBeInTheDocument();
    expect(screen.getByLabelText('Download 2 selected images as ZIP')).toBeInTheDocument();
    expect(screen.getByText('Selected: 2 of 3 images')).toBeInTheDocument();
  });

  it('should handle download all button click', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const downloadAllButton = screen.getByLabelText('Download all converted images as ZIP');
    fireEvent.click(downloadAllButton);

    expect(mockOnDownloadAll).toHaveBeenCalled();
  });

  it('should handle select all button click', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const selectAllButton = screen.getByLabelText('Select all converted images');
    fireEvent.click(selectAllButton);

    expect(mockOnSelectAll).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('✅ Selected all 3 images');
  });

  it('should handle deselect all button click', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const deselectAllButton = screen.getByLabelText('Deselect all images');
    fireEvent.click(deselectAllButton);

    expect(mockOnDeselectAll).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('✅ Deselected all images');
  });

  it('should handle bulk download button click', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const bulkDownloadButton = screen.getByLabelText('Download 2 selected images as ZIP');
    fireEvent.click(bulkDownloadButton);

    expect(mockOnBulkDownload).toHaveBeenCalled();
  });

  it('should disable download all button when no converted images', () => {
    render(
      <BatchOperations
        convertedImages={[]}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const downloadAllButton = screen.getByLabelText('Download all converted images as ZIP');
    expect(downloadAllButton).toHaveAttribute('aria-disabled', 'true');
    expect(downloadAllButton).toHaveAttribute('tabIndex', '-1');
  });

  it('should disable select all button when no converted images', () => {
    render(
      <BatchOperations
        convertedImages={[]}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const selectAllButton = screen.getByLabelText('Select all converted images');
    expect(selectAllButton).toHaveAttribute('aria-disabled', 'true');
    expect(selectAllButton).toHaveAttribute('tabIndex', '-1');
  });

  it('should disable deselect all button when no selected images', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const deselectAllButton = screen.getByLabelText('Deselect all images');
    expect(deselectAllButton).toHaveAttribute('aria-disabled', 'true');
    expect(deselectAllButton).toHaveAttribute('tabIndex', '-1');
  });

  it('should disable bulk download button when no selected images', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const bulkDownloadButton = screen.getByLabelText('Download 0 selected images as ZIP');
    expect(bulkDownloadButton).toHaveAttribute('aria-disabled', 'true');
    expect(bulkDownloadButton).toHaveAttribute('tabIndex', '-1');
  });

  it('should show warning when trying to download all with no images', () => {
    render(
      <BatchOperations
        convertedImages={[]}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const downloadAllButton = screen.getByLabelText('Download all converted images as ZIP');
    fireEvent.click(downloadAllButton);

    expect(toast.warning).toHaveBeenCalledWith('⚠️ No converted images available for download');
    expect(mockOnDownloadAll).not.toHaveBeenCalled();
  });

  it('should show warning when trying to select all with no images', () => {
    render(
      <BatchOperations
        convertedImages={[]}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const selectAllButton = screen.getByLabelText('Select all converted images');
    fireEvent.click(selectAllButton);

    expect(toast.warning).toHaveBeenCalledWith('⚠️ No images to select');
    expect(mockOnSelectAll).not.toHaveBeenCalled();
  });

  it('should show warning when trying to deselect all with no selected images', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const deselectAllButton = screen.getByLabelText('Deselect all images');
    fireEvent.click(deselectAllButton);

    expect(toast.warning).toHaveBeenCalledWith('⚠️ No images currently selected');
    expect(mockOnDeselectAll).not.toHaveBeenCalled();
  });

  it('should show warning when trying to bulk download with no selected images', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={[]}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const bulkDownloadButton = screen.getByLabelText('Download 0 selected images as ZIP');
    fireEvent.click(bulkDownloadButton);

    expect(toast.warning).toHaveBeenCalledWith('⚠️ Please select images first');
    expect(mockOnBulkDownload).not.toHaveBeenCalled();
  });

  it('should handle keyboard events for download all button', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const downloadAllButton = screen.getByLabelText('Download all converted images as ZIP');

    fireEvent.keyDown(downloadAllButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnDownloadAll).toHaveBeenCalled();

    fireEvent.keyDown(downloadAllButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnDownloadAll).toHaveBeenCalled();
  });

  it('should handle keyboard events for select all button', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const selectAllButton = screen.getByLabelText('Select all converted images');

    fireEvent.keyDown(selectAllButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnSelectAll).toHaveBeenCalled();

    fireEvent.keyDown(selectAllButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnSelectAll).toHaveBeenCalled();
  });

  it('should handle keyboard events for deselect all button', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const deselectAllButton = screen.getByLabelText('Deselect all images');

    fireEvent.keyDown(deselectAllButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnDeselectAll).toHaveBeenCalled();

    fireEvent.keyDown(deselectAllButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnDeselectAll).toHaveBeenCalled();
  });

  it('should handle keyboard events for bulk download button', () => {
    render(
      <BatchOperations
        convertedImages={mockConvertedImages}
        selectedImages={mockSelectedImages}
        onDownloadAll={mockOnDownloadAll}
        onSelectAll={mockOnSelectAll}
        onDeselectAll={mockOnDeselectAll}
        onBulkDownload={mockOnBulkDownload}
      />
    );

    const bulkDownloadButton = screen.getByLabelText('Download 2 selected images as ZIP');

    fireEvent.keyDown(bulkDownloadButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnBulkDownload).toHaveBeenCalled();

    fireEvent.keyDown(bulkDownloadButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnBulkDownload).toHaveBeenCalled();
  });
});