# Image Optimizer

A comprehensive image optimization tool (v2.2.0) with React frontend and Node.js backend that supports multiple image formats and provides various optimization presets. Now with full accessibility support including ARIA attributes, keyboard navigation, focus management, screen reader compatibility, advanced comparison metrics, and comprehensive testing infrastructure.

## Features

- **Multiple Format Support**: JPG, PNG, WEBP, GIF, BMP, TIFF
- **Optimization Presets**: Web, Print, Social Media, Mobile, Thumbnail
- **Batch Processing**: Upload and optimize multiple images at once
- **Batch Operations**: ZIP download for multiple images, bulk selection and download
- **Quality Comparison**: Side-by-side comparison of original vs optimized images with detailed comparison metrics (file size reduction, bytes saved, compression ratio)
- **Advanced Settings**: Custom quality, dimensions, and compression options
- **Memory Management**: Proper cleanup of object URLs to prevent memory leaks
- **Comprehensive Error Handling**: File validation, user-friendly notifications, and detailed logging
- **Security Enhancements**: Input validation, file type verification, rate limiting, and security headers
- **Accessibility Features**: Full ARIA support, keyboard navigation, focus management, and screen reader compatibility

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git
- Docker (optional, for containerized deployment)

### Setup

```bash
# Clone the repository
git clone https://github.com/Li8ning/image-optimizer.git

# Navigate to the project directory
cd image-optimizer

# Install dependencies
npm install
```

### Quick Start

```bash
# Start both frontend and backend with one command
npm run start:full

# Or use the start script with environment
./start-app.sh development
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
6. **Accessibility Implementation**: Full WCAG compliance with ARIA attributes, keyboard navigation, focus management, and screen reader support

## Development

### Running the Project

```bash
# Development mode (frontend only)
npm start

# Backend server only
npm run server

# Start both frontend and backend (recommended)
npm run start:full

# Production build
npm run build

# Start production server
npm run server
```

### Available Scripts

- `npm start`: Starts the React development server (frontend)
- `npm run server`: Starts the Node.js backend server
- `npm run start:full`: Starts both frontend and backend simultaneously
- `npm run build`: Creates a production build
- `npm test`: Runs all tests with Jest
- `npm test -- --coverage`: Runs tests with coverage reporting
- `npm test -- --watch`: Runs tests in watch mode
- `npm run lint`: Runs ESLint with auto-fix
- `npm run lint:check`: Runs ESLint without auto-fix
- `npm run eject`: Ejects from Create React App (if applicable)

### Environment Configuration

The application supports environment-specific configuration:

```bash
# Copy the example environment file
cp .env.example .env

# Or use environment-specific files
cp .env.development .env  # Development
cp .env.staging .env      # Staging
cp .env.production .env   # Production
```

Edit the `.env` file to configure:
- `APP_NAME`: Application name
- `PORT`: Frontend port (default: 3000)
- `BACKEND_PORT`: Backend port (default: 3001)
- `MAX_FILE_SIZE`: Maximum upload size
- `ALLOWED_FILE_TYPES`: Supported file types
- `DEFAULT_QUALITY`: Default image quality
- `DEFAULT_RESIZE_WIDTH`: Default resize width

### Docker Deployment

```bash
# Build Docker image
docker build -t image-optimizer .

# Run container
docker run -p 3000:3000 -p 3001:3001 image-optimizer
```

## Deployment Automation

### CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline using GitHub Actions:

**Workflow**: `.github/workflows/ci-cd.yml`

**Features:**
- Continuous Integration on every push/pull request
- Automated testing with Jest
- ESLint code quality checks
- Production build generation
- Environment-specific deployment (staging/production)
- Docker image building and pushing

**Triggers:**
- Pushes to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

### Deployment Scripts

**Available Scripts:**

1. **deploy.sh**: Main deployment script
   ```bash
   ./deployment/scripts/deploy.sh --env staging
   ```

2. **health-check.sh**: Health monitoring
   ```bash
   ./deployment/scripts/health-check.sh --url http://localhost:3001/health
   ```

3. **start-app.sh**: Combined startup
   ```bash
   ./start-app.sh production
   ```

### Deployment Workflow

```bash
# 1. Install dependencies
npm install

# 2. Run tests
npm test

# 3. Build for production
npm run build

# 4. Start the application
npm run start:full

# 5. Verify health
curl http://localhost:3001/health
```

### Environment Variables

Create `.env` files for different environments:

```bash
# Development environment
cp .env.example .env.development

# Staging environment
cp .env.example .env.staging

# Production environment
cp .env.example .env.production
```

Then edit the files to set environment-specific values.

## Version History

- **v2.3.0** (Upcoming): Deployment Automation - Comprehensive CI/CD pipeline with GitHub Actions, environment-specific configuration, deployment scripts, Docker support, health monitoring, and centralized configuration management. One-command startup with port conflict resolution.
- **v2.2.0** (Current): Comprehensive Testing Infrastructure - Added complete testing infrastructure with Jest framework, comprehensive unit tests for all core components (7 components, 2 services, 1 utility), integration testing for key workflows, ESLint configuration with build directory exclusion, achieved 86.66% service coverage and 94.64% utility coverage, fixed all ESLint errors, and added detailed testing documentation.
- **v2.1.0**: Comparison Metrics Enhancement - Added detailed comparison metrics to the image comparison feature including file size reduction percentage, bytes saved, and compression ratio. Maintained all accessibility features and fixed React hooks ordering issues for improved stability.
- **v2.0.0**: Accessibility Improvements - Added comprehensive accessibility features including ARIA attributes throughout the application, implemented keyboard navigation support for all interactive elements, ensured proper focus management with modal focus trapping, added screen reader support with announcement system, full WCAG compliance for better accessibility
- **v1.8.0**: Large batch processing support - Fixed "Too many files" error by increasing Multer file limit from 20 to 100 files, replaced problematic react-window Grid with custom VirtualizedGrid component to handle large image sets, enhanced batch processing capabilities for handling 100+ images efficiently
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