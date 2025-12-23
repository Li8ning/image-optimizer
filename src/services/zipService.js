import JSZip from 'jszip';
import { saveAs } from 'file-saver';

class ZipService {
    static async createAndDownloadZip(convertedImages, zipName = 'converted_images') {
        try {
            const zip = new JSZip();
            
            // Add each converted image to the ZIP file
            const promises = convertedImages.map(async (image) => {
                try {
                    // Fetch the image blob from the server
                    const blob = await this.fetchImageBlob(image.url);
                     
                    // Add the blob to the ZIP file
                    zip.file(image.name, blob);
                     
                    return { success: true, name: image.name };
                } catch (error) {
                    console.error(`Failed to add ${image.name} to ZIP:`, error);
                    return { success: false, name: image.name, error: error.message };
                }
            });
            
            // Wait for all images to be added to the ZIP
            const results = await Promise.all(promises);
            
            // Generate the ZIP file
            const zipContent = await zip.generateAsync({ type: 'blob' });
            
            // Download the ZIP file
            saveAs(zipContent, `${zipName}.zip`);
            
            return {
                success: true,
                totalImages: convertedImages.length,
                successfulImages: results.filter(r => r.success).length,
                failedImages: results.filter(r => !r.success),
                zipSize: zipContent.size
            };
            
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            throw new Error(`Failed to create ZIP file: ${error.message}`);
        }
    }
    
    static async fetchImageBlob(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            return await response.blob();
        } catch (error) {
            console.error(`Error fetching image blob for ${url}:`, error);
            throw error;
        }
    }
    
    static async createZipFromUrls(imageUrls, filenames, zipName = 'images') {
        try {
            const zip = new JSZip();
            
            const promises = imageUrls.map(async (url, idx) => {
                try {
                    const blob = await this.fetchImageBlob(url);
                    // eslint-disable-next-line no-unused-vars
                    const filename = filenames[idx] || `image_${idx + 1}.webp`;
                    zip.file(filename, blob);
                    return { success: true, filename };
                } catch (error) {
                    console.error(`Failed to add ${url} to ZIP:`, error);
                    return { success: false, url, error: error.message };
                }
            });
            
            const results = await Promise.all(promises);
            const zipContent = await zip.generateAsync({ type: 'blob' });
            saveAs(zipContent, `${zipName}.zip`);
            
            return {
                success: true,
                totalImages: imageUrls.length,
                successfulImages: results.filter(r => r.success).length,
                failedImages: results.filter(r => !r.success)
            };
            
        } catch (error) {
            console.error('Error creating ZIP from URLs:', error);
            throw new Error(`Failed to create ZIP from URLs: ${error.message}`);
        }
    }
}

export default ZipService;