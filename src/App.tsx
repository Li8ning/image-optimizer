import { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dropzone } from './components/Dropzone';
import { ImageGrid } from './components/ImageGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { ResizePresets } from './components/ResizePresets';
import { PreviewModal } from './components/PreviewModal';
import { DownloadButton } from './components/DownloadButton';
import { DownloadStats } from './components/DownloadStats';
import { Button } from './components/ui/Button';
import { useImageStore } from './hooks/useImageStore';
import type { ImageFormat, ProcessOptions } from './types/image';
import { processBatch } from './lib/batchProcessor';
import { Loader2, Zap } from 'lucide-react';

function App() {
  const {
    addImages,
    globalSettings,
    images,
    updateGlobalSettings,
    removeImage,
    updateImageOptions,
    setImageStatus,
    setProcessedImage,
    clearAll
  } = useImageStore();
  const [expandedSettingsId, setExpandedSettingsId] = useState<string | null>(null);
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    addImages(files);
  }, [addImages]);

  const handleSelectPreset = useCallback((width: number, height: number) => {
    updateGlobalSettings({ width, height });
  }, [updateGlobalSettings]);

  const handleRemoveImage = useCallback((id: string) => {
    removeImage(id);
  }, [removeImage]);

  const handleSettingsToggle = useCallback((id: string) => {
    setExpandedSettingsId(prev => prev === id ? null : id);
  }, []);

  const handleUpdateImageOptions = useCallback((id: string, options: Partial<ProcessOptions>) => {
    updateImageOptions(id, options);
  }, [updateImageOptions]);

  const handlePreview = useCallback((id: string) => {
    setPreviewImageId(id);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewImageId(null);
  }, []);

  const handleConvertImages = useCallback(async () => {
    const pendingImages = images.filter(img => img.status === 'pending' || img.status === 'error');
    if (pendingImages.length === 0) {
      alert('No images to convert. Upload images first.');
      return;
    }

    setIsProcessing(true);

    try {
      const results = await processBatch(
        pendingImages,
        globalSettings as ProcessOptions,
        (id, progress) => {
          // Update individual image status via store
          if (progress === 0) {
            setImageStatus(id, 'processing');
          }
        }
      );

      // Update store with results
      for (const result of results) {
        if (result.status === 'done' && result.processedBlob) {
          setProcessedImage(result.id, result.processedBlob, result.processedSize!);
        } else if (result.status === 'error') {
          setImageStatus(result.id, 'error');
        }
      }
    } catch (error) {
      console.error('Batch processing failed:', error);
      alert('Some images failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [images, globalSettings, setImageStatus, setProcessedImage]);

  const formatLabels: Record<ImageFormat, string> = {
    webp: 'WebP',
    jpeg: 'JPEG',
    png: 'PNG',
    avif: 'AVIF',
  };

  const activeImagesCount = images.filter(img => img.status === 'pending').length;
  const processedImagesCount = images.filter(img => img.status === 'done').length;
  const hasPendingImages = activeImagesCount > 0;

  const previewImage = images.find(img => img.id === previewImageId) || null;

  return (
    <Layout>
      {/* Preview Modal */}
      <PreviewModal
        image={previewImage}
        isOpen={previewImageId !== null}
        onClose={handleClosePreview}
        hasPrevious={images.findIndex(img => img.id === previewImageId) > 0}
        hasNext={images.findIndex(img => img.id === previewImageId) < images.length - 1}
        onPrevious={() => {
          const currentIndex = images.findIndex(img => img.id === previewImageId);
          if (currentIndex > 0) {
            setPreviewImageId(images[currentIndex - 1].id);
          }
        }}
        onNext={() => {
          const currentIndex = images.findIndex(img => img.id === previewImageId);
          if (currentIndex < images.length - 1) {
            setPreviewImageId(images[currentIndex + 1].id);
          }
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Dropzone */}
            <Dropzone onFilesSelected={handleFilesSelected} />

            {/* Image Grid */}
            {images.length > 0 && (
              <ImageGrid
                images={images}
                onRemove={handleRemoveImage}
                onSettingsToggle={handleSettingsToggle}
                onUpdateImageOptions={handleUpdateImageOptions}
                onPreview={handlePreview}
                expandedSettingsId={expandedSettingsId}
              />
            )}

            {/* Convert Button */}
            {hasPendingImages && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleConvertImages}
                disabled={isProcessing}
                leftIcon={isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? 'Converting...' : `Convert ${activeImagesCount} Image${activeImagesCount > 1 ? 's' : ''}`}
              </Button>
            )}

            {/* Settings Panel */}
            <SettingsPanel onSelectPreset={handleSelectPreset} />

            {/* Resize Presets */}
            <ResizePresets onSelectPreset={handleSelectPreset} />

            {/* Clear All Button */}
            {images.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove all images?')) {
                    clearAll();
                  }
                }}
                className="w-full py-3 px-4 bg-slate-200 text-slate-700 rounded-lg font-medium
                         hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 
                         focus:ring-slate-500 focus:ring-offset-2"
              >
                Clear All Images
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Settings Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Format</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatLabels[globalSettings.format || 'webp']}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Quality</span>
                  <span className="text-sm font-medium text-slate-900">
                    {globalSettings.quality || 80}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Scale</span>
                  <span className="text-sm font-medium text-slate-900">
                    {globalSettings.scale ? `${globalSettings.scale}%` : '100%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Resize</span>
                  <span className="text-sm font-medium text-slate-900">
                    {globalSettings.width 
                      ? `${globalSettings.width}×${globalSettings.height || 'Auto'}px`
                      : 'Original'}
                  </span>
                </div>
                {globalSettings.width && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Mode</span>
                    <span className="text-sm font-medium text-slate-900 capitalize">
                      {globalSettings.resizeMode || 'fit'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Aspect Ratio</span>
                  <span className="text-sm font-medium text-slate-900">
                    {globalSettings.maintainAspectRatio !== false ? 'Maintained' : 'Free'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Pending Images</span>
                  <span className="font-medium text-slate-900">{activeImagesCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-slate-600">Processed</span>
                  <span className="font-medium text-green-600">{processedImagesCount}</span>
                </div>
              </div>
            </div>

            {/* Download Stats */}
            <DownloadStats images={images} />

            {/* Download Button */}
            <DownloadButton 
              images={images}
              onDownloadComplete={() => {
                console.log('Download completed!');
              }}
              onDownloadError={(error) => {
                console.error('Download error:', error);
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
