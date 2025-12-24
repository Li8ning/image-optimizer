import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SettingsPanel from '../SettingsPanel';

describe('SettingsPanel Component', () => {
  const mockOnPresetChange = jest.fn();
  const mockOnQualityChange = jest.fn();
  const mockOnResizeWidthChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the settings panel correctly', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={80}
        resizeWidth={0}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    expect(screen.getByText('Conversion Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Preset')).toBeInTheDocument();
    expect(screen.getByLabelText('Quality')).toBeInTheDocument();
    expect(screen.getByLabelText('Resize Width')).toBeInTheDocument();
  });

  it('should handle preset changes', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={80}
        resizeWidth={0}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    const presetSelect = screen.getByLabelText('Preset');
    fireEvent.change(presetSelect, { target: { value: 'Web' } });

    expect(mockOnPresetChange).toHaveBeenCalledWith('Web');
  });

  it('should handle quality changes', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={80}
        resizeWidth={0}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    const qualityInput = screen.getByLabelText('Quality');
    fireEvent.change(qualityInput, { target: { value: '90' } });

    expect(mockOnQualityChange).toHaveBeenCalledWith(90);
  });

  it('should handle resize width changes', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={80}
        resizeWidth={0}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    const resizeWidthInput = screen.getByLabelText('Resize Width');
    fireEvent.change(resizeWidthInput, { target: { value: '800' } });

    expect(mockOnResizeWidthChange).toHaveBeenCalledWith(800);
  });

  it('should display current quality and resize width values', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={75}
        resizeWidth={1200}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    const qualityInput = screen.getByLabelText('Quality');
    const resizeWidthInput = screen.getByLabelText('Resize Width');

    expect(qualityInput).toHaveValue(75);
    expect(resizeWidthInput).toHaveValue(1200);
  });

  it('should show all preset options', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={80}
        resizeWidth={0}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    const presetSelect = screen.getByLabelText('Preset');
    expect(presetSelect).toHaveValue('Custom');

    // Check that all preset options are available
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6); // Custom, Web, Print, Social Media, Mobile, Thumbnail
    expect(screen.getByText('Web')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(screen.getByText('Thumbnail')).toBeInTheDocument();
  });

  it('should handle invalid quality input', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={80}
        resizeWidth={0}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    const qualityInput = screen.getByLabelText('Quality');
    fireEvent.change(qualityInput, { target: { value: 'invalid' } });

    // Should not call the handler for invalid input
    expect(mockOnQualityChange).not.toHaveBeenCalled();
  });

  it('should handle invalid resize width input', () => {
    render(
      <SettingsPanel
        preset="Custom"
        quality={80}
        resizeWidth={0}
        onPresetChange={mockOnPresetChange}
        onQualityChange={mockOnQualityChange}
        onResizeWidthChange={mockOnResizeWidthChange}
      />
    );

    const resizeWidthInput = screen.getByLabelText('Resize Width');
    fireEvent.change(resizeWidthInput, { target: { value: 'invalid' } });

    // Should not call the handler for invalid input
    expect(mockOnResizeWidthChange).not.toHaveBeenCalled();
  });
});