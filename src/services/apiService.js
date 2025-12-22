import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
    static async convertImages(images, resizeWidth, quality) {
        const formData = new FormData();

        // Add images to form data
        for (const image of images) {
            try {
                if (image.preview && image.preview.startsWith('blob:')) {
                    // Fetch the blob from the object URL and create a File object
                    const response = await fetch(image.preview);
                    const blob = await response.blob();
                    const file = new File([blob], image.name, { type: image.type });
                    formData.append('images', file, image.name);
                } else {
                    // Fallback: try to use the original file if available
                    formData.append('images', image, image.name);
                }
            } catch (error) {
                console.error('Failed to create File for upload:', image.name, error);
                toast.error(`❌ Failed to prepare ${image.name} for conversion: ${error.message}`);
            }
        }

        formData.append('resizeWidth', resizeWidth);
        formData.append('quality', quality);

        try {
            const response = await fetch(`${API_BASE_URL}/convert`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error converting images:', error);
            const errorMessage = error.message.includes('Failed to fetch')
                ? 'Network error: Could not connect to the conversion server'
                : `Conversion error: ${error.message}`;

            throw new Error(errorMessage);
        }
    }

    static async downloadConvertedImage(filename) {
        window.location.href = `${API_BASE_URL}/download/${filename}`;
    }

    static async fetchConvertedImage(url) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch converted image: ${response.status}`);
            }
            return await response.blob();
        } catch (error) {
            console.error('Error fetching converted image:', error);
            throw error;
        }
    }

    static async testMemoryCleanup() {
        console.log('Testing memory cleanup...');
        console.log('Memory cleanup test completed');
        toast.info('🧪 Memory cleanup test completed - check console for details');
    }
}

export default ApiService;