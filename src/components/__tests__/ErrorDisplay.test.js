import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ErrorDisplay from '../ErrorDisplay';

describe('ErrorDisplay Component', () => {
  const mockErrors = [
    { fileName: 'test1.jpg', message: 'Failed to convert test1.jpg' },
    { fileName: 'test2.png', message: 'Invalid file type for test2.png' },
    { fileName: null, message: 'Network error occurred' }
  ];

  const mockOnClearErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when there are no errors', () => {
    const { container } = render(<ErrorDisplay errors={[]} onClearErrors={mockOnClearErrors} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render error history when there are errors', () => {
    render(<ErrorDisplay errors={mockErrors} onClearErrors={mockOnClearErrors} />);

    expect(screen.getByText('Error History (3)')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear all errors')).toBeInTheDocument();
  });

  it('should display all error messages', () => {
    render(<ErrorDisplay errors={mockErrors} onClearErrors={mockOnClearErrors} />);

    expect(screen.getByText('test1.jpg: Failed to convert test1.jpg')).toBeInTheDocument();
    expect(screen.getByText('test2.png: Invalid file type for test2.png')).toBeInTheDocument();
    expect(screen.getByText('System: Network error occurred')).toBeInTheDocument();
  });

  it('should handle clear errors button click', () => {
    render(<ErrorDisplay errors={mockErrors} onClearErrors={mockOnClearErrors} />);

    const clearButton = screen.getByLabelText('Clear all errors');
    fireEvent.click(clearButton);

    expect(mockOnClearErrors).toHaveBeenCalled();
  });

  it('should handle clear errors button keyboard events', () => {
    render(<ErrorDisplay errors={mockErrors} onClearErrors={mockOnClearErrors} />);

    const clearButton = screen.getByLabelText('Clear all errors');

    fireEvent.keyDown(clearButton, { key: 'Enter', preventDefault: jest.fn() });
    expect(mockOnClearErrors).toHaveBeenCalled();

    fireEvent.keyDown(clearButton, { key: ' ', preventDefault: jest.fn() });
    expect(mockOnClearErrors).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<ErrorDisplay errors={mockErrors} onClearErrors={mockOnClearErrors} />);

    const errorHistory = screen.getByRole('region', { name: 'Error history' });
    expect(errorHistory).toHaveAttribute('aria-live', 'polite');

    const clearButton = screen.getByLabelText('Clear all errors');
    expect(clearButton).toHaveAttribute('aria-describedby', 'error-history-title');
    expect(clearButton).toHaveAttribute('tabIndex', '0');
  });

  it('should handle single error correctly', () => {
    const singleError = [
      { fileName: 'single.jpg', message: 'Single error message' }
    ];

    render(<ErrorDisplay errors={singleError} onClearErrors={mockOnClearErrors} />);

    expect(screen.getByText('Error History (1)')).toBeInTheDocument();
    expect(screen.getByText('single.jpg: Single error message')).toBeInTheDocument();
  });

  it('should handle errors with long messages', () => {
    const longError = [
      { 
        fileName: 'long.jpg', 
        message: 'This is a very long error message that should still be displayed correctly in the error display component without breaking the layout or causing any rendering issues.'
      }
    ];

    render(<ErrorDisplay errors={longError} onClearErrors={mockOnClearErrors} />);

    expect(screen.getByText('long.jpg: This is a very long error message that should still be displayed correctly in the error display component without breaking the layout or causing any rendering issues.')).toBeInTheDocument();
  });
});