# Image Optimizer

A comprehensive image optimization tool (v1.8.0) with React frontend and Node.js backend that supports multiple image formats and provides various optimization presets.

## Features

- **Multiple Format Support**: JPG, PNG, WEBP, GIF, BMP, TIFF
- **Optimization Presets**: Web, Print, Social Media, Mobile, Thumbnail
- **Batch Processing**: Upload and optimize multiple images at once
- **Quality Comparison**: Side-by-side comparison of original vs optimized images
- **Advanced Settings**: Custom quality, dimensions, and compression options
- **Memory Management**: Proper cleanup of object URLs to prevent memory leaks
- **Comprehensive Error Handling**: File validation, user-friendly notifications, and detailed logging
- **Security Enhancements**: Input validation, file type verification, rate limiting, and security headers

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Li8ning/image-optimizer.git

# Navigate to the project directory
cd image-optimizer

# Install dependencies
npm install

# Start the development server
npm start
```

## Usage

1. **Upload Images**: Drag and drop images or use the file picker
2. **Select Preset**: Choose from Web, Print, Social Media, Mobile, or Thumbnail
3. **Customize Settings**: Adjust quality, dimensions, and other parameters
4. **Optimize**: Click the optimize button to process your images
5. **Compare & Download**: View side-by-side comparison and download optimized images

## Project Structure

```
image-optimizer/
├── src/                  # React frontend components
│   ├── App.js           # Main application component
│   └── index.js         # Entry point
├── public/              # Static assets
├── plans/               # Project planning and tracking
├── server.js            # Node.js backend server
├── package.json         # Project dependencies
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## Technical Details

### Frontend
- **Framework**: React
- **State Management**: React hooks (useState, useEffect)
- **Image Processing**: Browser-based optimization with proper memory management
- **UI Components**: Responsive design with file upload, preview, and comparison features

### Backend
- **Server**: Node.js with Express
- **API Endpoints**: File upload, optimization processing
- **Security**: Input validation, rate limiting, security headers
- **Error Handling**: Comprehensive error logging and user feedback

### Key Features Implemented

1. **Unified Frontend**: React-based implementation with vanilla JS removed
2. **Error Handling**: File validation, server-side validation, user notifications
3. **Memory Cleanup**: Object URL tracking and automatic cleanup system
4. **Security**: Input sanitization, file type verification, rate limiting
5. **Git Integration**: Version control with comprehensive .gitignore

## Development

### Running the Project

```bash
# Development mode
npm start

# Production build
npm run build

# Start production server
node server.js
```

### Available Scripts

- `npm start`: Starts the development server
- `npm run build`: Creates a production build
- `npm test`: Runs tests (if configured)
- `npm run eject`: Ejects from Create React App (if applicable)

## Version History

- **v1.8.0** (Current): Large batch processing support - Fixed "Too many files" error by increasing Multer file limit from 20 to 100 files, replaced problematic react-window Grid with custom VirtualizedGrid component to handle large image sets, enhanced batch processing capabilities for handling 100+ images efficiently
- **v1.7.0**: Progress tracking and Git setup completed - Real-time progress indicators for individual file processing and complete Git repository setup with remote integration
- **v1.6.0**: Image preview fix completed - Fixed image preview functionality by implementing proper object URL creation and tracking system with enhanced error handling and fallback UI
- **v1.5.0**: Infinite re-render fix completed - Fixed critical React infinite re-render error during image upload by refactoring state management and object URL creation to avoid render-time state updates
- **v1.4.0**: Security enhancements completed - Comprehensive security measures including input validation/sanitization, file type verification using magic numbers, rate limiting, security headers, XSS protection, request validation middleware, secure file handling, and security logging
- **v1.3.0**: Memory cleanup implementation completed - Comprehensive object URL tracking and cleanup system to prevent memory leaks
- **v1.2.0**: Error handling improvements - Comprehensive error handling with file validation, server-side validation, user-friendly notifications, error recovery, and detailed logging
- **v1.1.0**: Frontend unification - React chosen as unified frontend, vanilla JS implementation removed
- **v1.0.0**: Initial release - Basic image optimization functionality

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have suggestions, please open an issue on the GitHub repository.