# Image Optimizer Web App

A modern, client-side image optimization web application built with React, TypeScript, and WebAssembly. Convert and compress images to WebP, AVIF, JPEG, and PNG formats with adjustable quality settings - all in your browser without any server uploads.

## Features

- **Multi-Format Support**: Convert images to WebP, AVIF, JPEG, and PNG formats
- **Client-Side Processing**: All image processing happens in your browser using WebAssembly - no server uploads required
- **Batch Processing**: Upload and process multiple images simultaneously
- **Quality Control**: Adjustable quality settings for optimal compression
- **Resize Presets**: Quick resize options (Thumbnail, Small, Medium, Large, Original)
- **Real-Time Preview**: Compare original and optimized images
- **Batch Download**: Download all processed images as a ZIP file
- **Compression Stats**: View size savings and compression ratios
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode UI**: Modern, clean interface with dark theme
- **Local Storage Persistence**: Your settings are saved locally

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persistence
- **Image Processing**: WebAssembly via @jsquash (avif, jpeg, png, webp, resize)
- **UI Components**: Custom components with Lucide icons
- **Testing**: Vitest with jsdom
- **Code Quality**: ESLint with TypeScript support

## Installation

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/img-optimizer.git
   cd img-optimizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173`

## Usage

### Uploading Images

1. Drag and drop images onto the dropzone area
2. Or click the dropzone to select files from your computer
3. Supported formats: JPEG, PNG, WebP, AVIF, GIF, BMP

### Converting Images

1. Select one or more images from the grid
2. Choose the output format (WebP, AVIF, JPEG, PNG)
3. Adjust the quality slider (0-100)
4. Optionally select a resize preset
5. Click "Optimize Selected" to process the images

### Downloading

1. Individual: Click the download icon on any processed image
2. Batch: Click "Download All" to get a ZIP file with all processed images

### Settings

Access the settings panel to configure:
- Default output format
- Default quality level
- Auto-optimize on upload
- History retention

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# No environment variables required for basic functionality
# All processing is client-side
```

### Build Configuration

Modify `vite.config.ts` for custom build settings:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
```

## Project Structure

```
img-optimizer/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── Dropzone.tsx   # File upload component
│   │   ├── Header.tsx     # App header
│   │   ├── ImageGrid.tsx  # Image gallery
│   │   ├── Layout.tsx     # Main layout
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   │   ├── imageProcessor.ts   # WASM image processing
│   │   ├── batchProcessor.ts   # Batch processing logic
│   │   └── download.ts         # Download utilities
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper utilities
├── .gitignore
├── eslint.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run linting
npm run lint

# Run linting with auto-fix
npm run lint -- --fix
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://react.dev/) - The library for web and native user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [@jsquash](https://github.com/joshua-woods/jsquash) - WebAssembly image processing library
- [Zustand](https://github.com/pmndrs/zustand) - Bear necessities for state management
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- [JSZip](https://stuk.github.io/jszip/) - Create, read and edit .zip files

---

Built with ❤️ using React, TypeScript, and WebAssembly
