import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ImageUpload from '../ImageUpload';

describe('ImageUpload Component', () => {
  const mockOnFilesUploaded = jest.fn();
  const mockSetIsDragging = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the upload component correctly', () => {
    render(<ImageUpload onFilesUploaded={mockOnFilesUploaded} setIsDragging={mockSetIsDragging} />);

    expect(screen.getByText('Drag & drop images here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse files')).toBeInTheDocument();
    expect(screen.getByText('Supports: JPG, PNG, WEBP, GIF, etc.')).toBeInTheDocument();
  });

  it('should handle drag over events', () => {
    render(<ImageUpload onFilesUploaded={mockOnFilesUploaded} setIsDragging={mockSetIsDragging} />);
    const dropZone = screen.getByRole('button', { name: 'Drag and drop images here or click to browse files' });

    fireEvent.dragOver(dropZone, { preventDefault: jest.fn(), stopPropagation: jest.fn() });
    expect(mockSetIsDragging).not.toHaveBeenCalled();
  });

  it('should handle drag enter events', () => {
    render(<ImageUpload onFilesUploaded={mockOnFilesUploaded} setIsDragging={mockSetIsDragging} />);
    const dropZone = screen.getByRole('button', { name: 'Drag and drop images here or click to browse files' });

    fireEvent.dragEnter(dropZone, { preventDefault: jest.fn(), stopPropagation: jest.fn() });
    expect(mockSetIsDragging).toHaveBeenCalledWith(true);
  });

  it('should handle drag leave events', () => {
    render(<ImageUpload onFilesUploaded={mockOnFilesUploaded} setIsDragging={mockSetIsDragging} />);
    const dropZone = screen.getByRole('button', { name: 'Drag and drop images here or click to browse files' });

    fireEvent.dragLeave(dropZone, { preventDefault: jest.fn(), stopPropagation: jest.fn() });
    expect(mockSetIsDragging).toHaveBeenCalledWith(false);
  });

  it('should handle drop events and call onFilesUploaded', () => {
    const mockFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.png', { type: 'image/png' })
    ];

    render(<ImageUpload onFilesUploaded={mockOnFilesUploaded} setIsDragging={mockSetIsDragging} />);
    const dropZone = screen.getByRole('button', { name: 'Drag and drop images here or click to browse files' });

    fireEvent.drop(dropZone, {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: { files: mockFiles }
    });

    expect(mockSetIsDragging).toHaveBeenCalledWith(false);
    expect(mockOnFilesUploaded).toHaveBeenCalledWith(mockFiles);
  });

  it('should handle file input change events', () => {
    const mockFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.png', { type: 'image/png' })
    ];

    render(<ImageUpload onFilesUploaded={mockOnFilesUploaded} setIsDragging={mockSetIsDragging} />);
    const fileInput = screen.getByLabelText('Select images to upload');

    fireEvent.change(fileInput, { target: { files: mockFiles } });

    expect(mockOnFilesUploaded).toHaveBeenCalledWith(mockFiles);
  });

  it('should handle keyboard navigation for accessibility', () => {
    render(<ImageUpload onFilesUploaded={mockOnFilesUploaded} setIsDragging={mockSetIsDragging} />);
    const dropZone = screen.getByRole('button', { name: 'Drag and drop images here or click to browse files' });

    // Mock the click behavior
    const mockClick = jest.fn();
    document.getElementById = jest.fn(() => ({ click: mockClick }));

    fireEvent.keyDown(dropZone, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockClick).toHaveBeenCalled();

    fireEvent.keyDown(dropZone, { key: ' ', preventDefault: jest.fn() });
    expect(mockClick).toHaveBeenCalled();
  });
});