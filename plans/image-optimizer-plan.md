# Image Optimizer Web App - Architecture & Implementation Plan

## Overview
A client-side image optimization web app allowing users to upload multiple images, convert to WebP/AVIF/JPEG/PNG with adjustable quality and compression settings, with batch download capabilities.

## Tech Stack Recommendation

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast, production-ready)
- **Styling**: Tailwind CSS (rapid UI development)
- **State Management**: Zustand (lightweight, simple)
- **UI Components**: Radix UI or Shadcn/ui (accessible, customizable)

### Image Processing
- **@jsquash/avif** - AVIF encoding/decoding
- **@jsquash/jpeg** - JPEG encoding/decoding
- **@jsquash/png** - PNG encoding/decoding
- **@jsquash/webp** - WebP encoding/decoding
- **@jsquash/resize** - Image resizing operations

These libraries use WebAssembly for browser-native image processing (no server needed).

### Additional Libraries
- **dropzone** - Drag and drop file handling
- **file-saver** - Cross-browser file downloading
- **jszip** - Batch download as ZIP
- **lucide-react** - Icons

---

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Client - Browser
        UI[UI Layer - React]
        Store[State Management - Zustand]
        Drop[Dropzone Component]
        Preview[Image Preview Grid]
        Settings[Settings Panel]
        
        subgraph Image Processing Engine
            WASM[WebAssembly Modules]
            AVIF[@jsquash/avif]
            WEBP[@jsquash/webp]
            JPEG[@jsquash/jpeg]
            PNG[@jsquash/png]
        end
        
        subgraph Storage
            Local[Local Storage]
            IDB[IndexedDB - Large Files]
        end
    end
    
    User((User)) --> Drop
    User --> Settings
    Drop --> Store
    Settings --> Store
    Store --> WASM
    WASM --> AVIF
    WASM --> WEBP
    WASM --> JPEG
    WASM --> PNG
    Store --> Local
    Store --> IDB
```

---

## Feature Breakdown

### Core Features (MVP)
1. **Drag & Drop Upload** - Support multiple image files
2. **Format Conversion** - WebP, AVIF, JPEG, PNG
3. **Quality Control** - Adjustable compression (0-100)
4. **Preview** - Side-by-side original vs optimized comparison
5. **Batch Download** - Download all as ZIP or individually

### Advanced Features
1. **Resize Options** - Max width/height, custom dimensions, maintain aspect ratio
2. **Compression Presets** - Low/Medium/High/Maximum quality presets
3. **Format Presets** - Web (optimized), Photo, Lossless
4. **History Session** - Local storage of processed images
5. **Progress Tracking** - Real-time processing status

---

## Project Structure

```
img-optimizer/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Dropzone.tsx
│   │   ├── ImageGrid.tsx
│   │   ├── ImageCard.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── PreviewModal.tsx
│   │   ├── DownloadButton.tsx
│   │   └── Header.tsx
│   ├── hooks/
│   │   ├── useImageProcessor.ts
│   │   ├── useDropzone.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── imageProcessor.ts
│   │   ├── formatHelpers.ts
│   │   └── fileHelpers.ts
│   ├── store/
│   │   └── imageStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Data Models

```typescript
// Image processing options
interface ProcessOptions {
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  quality: number; // 0-100
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  preset?: 'web' | 'photo' | 'lossless';
}

// Uploaded image state
interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  processedBlob?: Blob;
  processedSize?: number;
  options: ProcessOptions;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

// App state
interface AppState {
  images: UploadedImage[];
  settings: ProcessOptions;
  isProcessing: boolean;
  totalProgress: number;
}
```

---

## Implementation Phases

### Phase 1: Setup & Core UI
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS
3. Create basic layout (header, main content, settings sidebar)
4. Implement Dropzone component with drag & drop

### Phase 2: Image Processing Engine
1. Install @jsquash libraries
2. Create image processor service
3. Implement single image conversion
4. Add quality adjustment controls

### Phase 3: UI Polish & Features
1. Build image grid with previews
2. Add individual image settings
3. Implement preview comparison modal
4. Add batch download (ZIP)

### Phase 4: Advanced Features
1. Resize functionality
2. Multiple format support
3. Compression presets
4. Local storage for session persistence

### Phase 5: Testing & Deployment
1. Write unit tests
2. Configure build optimization
3. Deploy to Vercel

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  🖼️ Image Optimizer                                [Export] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Drop images here or click to upload         │   │
│  │                    📁 Drag & Drop                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Settings ───────────────────────────────────────────┐  │
│  │  Format:    [WebP ▼]    Quality:    [75% ▼]         │  │
│  │  Resize:    [Keep Original ▼]                       │  │
│  │  Preset:    [Web Optimized ▼]                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Images (3) ───── [Download All ZIP] ─────────────────┐ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │ │
│  │  │ 🖼️ img1 │ │ 🖼️ img2 │ │ 🖼️ img3 │                  │ │
│  │  │ 245 KB  │ │ 189 KB  │ │ 312 KB  │                  │ │
│  │  │ → 89 KB │ │ → 67 KB │ │ → 98 KB │                  │ │
│  │  │ [↓] [⚙]│ │ [↓] [⚙]│ │ [↓] [⚙]│                  │ │
│  │  └─────────┘ └─────────┘ └─────────┘                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Free Tier Considerations

Since we're targeting free hosting:
1. **Client-side processing** - No server costs, uses user's browser
2. **Static build** - Vercel/Netlify free tier supports this
3. **IndexedDB** - For large files instead of server storage
4. **Bundle optimization** - Lazy load WASM modules on demand

---

## Next Steps

1. **Confirm this plan** - Are you happy with this architecture?
2. **Switch to Code mode** - Ready to implement?
3. **Adjust scope** - Any features to add/remove?
