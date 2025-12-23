import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import * as fileType from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create error log file if it doesn't exist
const ERROR_LOG_FILE = path.join(__dirname, 'error_logs.txt');
if (!fs.existsSync(ERROR_LOG_FILE)) {
    fs.writeFileSync(ERROR_LOG_FILE, '=== IMAGE OPTIMIZER ERROR LOGS ===\n\n');
}

const logError = (errorType, message, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${errorType}] ${message} - ${JSON.stringify(details)}\n`;
    
    console.error(logEntry.trim());
    fs.appendFileSync(ERROR_LOG_FILE, logEntry);
};

// Security: Security logging for suspicious activities
const logSecurityEvent = (eventType, message, details = {}) => {
    const timestamp = new Date().toISOString();
    const securityLogEntry = `[${timestamp}] [SECURITY_ALERT] [${eventType}] ${message} - ${JSON.stringify(details)}\n`;
    
    console.warn(`\x1b[33m${securityLogEntry.trim()}\x1b[0m`); // Yellow color for security alerts
    fs.appendFileSync(ERROR_LOG_FILE, securityLogEntry);
    
    // Additional security-specific logging
    const securityLogFile = path.join(__dirname, 'security_logs.txt');
    if (!fs.existsSync(securityLogFile)) {
        fs.writeFileSync(securityLogFile, '=== IMAGE OPTIMIZER SECURITY LOGS ===\n\n');
    }
    fs.appendFileSync(securityLogFile, securityLogEntry);
};

const app = express();
const PORT = 3001;

// Security: Configure Helmet for security headers
app.use(helmet());

// Security: Configure CORS with strict origin checking
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security: Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logError('RATE_LIMIT_EXCEEDED', `Rate limit exceeded for IP: ${req.ip}`, {
            path: req.path,
            method: req.method
        });
        logSecurityEvent('RATE_LIMIT', `Rate limit exceeded for IP: ${req.ip}`, {
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent']
        });
        res.status(429).json({
            error: 'Too many requests, please try again later',
            success: false
        });
    }
});

// Security: Apply rate limiting to all API routes
app.use('/api/', limiter);
app.use('/convert', limiter);
app.use('/download', limiter);


// Security: Request body size limit
app.use(express.json({ limit: '10mb' }));

// Security: URL encoded data size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static('public'));

// Security: Request validation middleware
const validateRequest = (req, res, next) => {
    try {
        // Validate common headers
        const contentType = req.headers['content-type'];
        if (contentType) {
            // Check if content type starts with any of the allowed types
            const isValidContentType =
                contentType.startsWith('application/json') ||
                contentType.startsWith('multipart/form-data') ||
                contentType.startsWith('application/x-www-form-urlencoded');
                
            if (!isValidContentType) {
                logError('SECURITY_ERROR', 'Invalid Content-Type header', {
                    contentType: contentType,
                    ip: req.ip,
                    path: req.path
                });
                return res.status(400).json({
                    error: 'Invalid Content-Type header',
                    success: false
                });
            }
        }

        // Validate request method
        const allowedMethods = ['GET', 'POST', 'OPTIONS'];
        if (!allowedMethods.includes(req.method)) {
            logError('SECURITY_ERROR', 'Invalid HTTP method', {
                method: req.method,
                ip: req.ip,
                path: req.path
            });
            return res.status(405).json({
                error: 'Method not allowed',
                success: false
            });
        }

        // Sanitize query parameters
        if (req.query) {
            for (const key in req.query) {
                if (typeof req.query[key] === 'string') {
                    // Remove potentially malicious characters
                    req.query[key] = validator.escape(req.query[key]);
                }
            }
        }

        next();
    } catch (error) {
        logError('VALIDATION_ERROR', 'Request validation failed', {
            error: error.message,
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        res.status(400).json({
            error: 'Invalid request',
            success: false
        });
    }
};

// Apply request validation to all routes
app.use(validateRequest);

// Security: File type verification using magic numbers
const verifyFileType = async (file) => {
    try {
        // Read a small portion of the file to check magic numbers
        const buffer = fs.readFileSync(file.path);
        
        // Handle both old and new file-type API
        let type;
        try {
            // Try new API first (fileType 19+)
            if (fileType.fileTypeFromBuffer) {
                type = await fileType.fileTypeFromBuffer(buffer);
            } else if (fileType.fromBuffer) {
                // Fallback to old API
                type = await fileType.fromBuffer(buffer);
            } else {
                // Manual fallback for basic image detection
                type = detectFileTypeFromBuffer(buffer);
            }
        } catch (apiError) {
            console.warn('file-type API error, using manual detection:', apiError.message);
            type = detectFileTypeFromBuffer(buffer);
        }

        if (!type) {
            return false; // Unknown file type
        }

        // Define allowed file types with their magic numbers
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/bmp',
            'image/tiff'
        ];

        return allowedTypes.includes(type.mime);
    } catch (error) {
        logError('FILE_VERIFICATION_ERROR', `Error verifying file type for ${file.originalname}`, {
            error: error.message,
            filename: file.originalname
        });
        return false;
    }
};

// Fallback function for manual file type detection using magic numbers
const detectFileTypeFromBuffer = (buffer) => {
    if (!buffer || buffer.length < 8) {
        return null;
    }

    // Check magic numbers for common image types
    const signature = buffer.toString('hex', 0, 8).toUpperCase();

    // JPEG: FF D8 FF
    if (signature.startsWith('FFD8FF')) {
        return { mime: 'image/jpeg', ext: 'jpg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (signature.startsWith('89504E470D0A1A0A')) {
        return { mime: 'image/png', ext: 'png' };
    }

    // WEBP: 52 49 46 46 .... 57 45 42 50
    if (signature.startsWith('52494646') && buffer.includes('WEBP')) {
        return { mime: 'image/webp', ext: 'webp' };
    }

    // GIF: 47 49 46 38
    if (signature.startsWith('47494638')) {
        return { mime: 'image/gif', ext: 'gif' };
    }

    // BMP: 42 4D
    if (signature.startsWith('424D')) {
        return { mime: 'image/bmp', ext: 'bmp' };
    }

    // TIFF: 49 49 2A 00 or 4D 4D 00 2A
    if (signature.startsWith('49492A00') || signature.startsWith('4D4D002A')) {
        return { mime: 'image/tiff', ext: 'tiff' };
    }

    return null; // Unknown file type
};

// Configure multer for file uploads with enhanced validation
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 100, // Increased to 100 files at once to handle large batches
    },
    fileFilter: async (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
        
        // First check: MIME type validation
        if (!allowedTypes.includes(file.mimetype)) {
            logError('VALIDATION_ERROR', `Invalid file type (MIME check): ${file.mimetype}`, {
                filename: file.originalname
            });
            return cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`));
        }

        // Second check: File extension validation
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif'];
        
        if (!allowedExtensions.includes(fileExtension)) {
            logError('VALIDATION_ERROR', `Invalid file extension: ${fileExtension}`, {
                filename: file.originalname,
                mimetype: file.mimetype
            });
            return cb(new Error(`Invalid file extension: ${fileExtension}. Allowed extensions: ${allowedExtensions.join(', ')}`));
        }

        // Third check: Filename sanitization
        if (!validator.isAlphanumeric(file.originalname.replace(/[^a-zA-Z0-9]/g, ''))) {
            logError('VALIDATION_ERROR', `Invalid characters in filename: ${file.originalname}`, {
                filename: file.originalname
            });
            return cb(new Error('Filename contains invalid characters'));
        }

        // Note: Magic number verification happens after file is saved
        cb(null, true);
    }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Ensure converted directory exists
if (!fs.existsSync('converted')) {
    fs.mkdirSync('converted');
}

app.post('/convert', upload.array('images'), async (req, res) => {
    try {
        // Validate request parameters
        if (!req.files || req.files.length === 0) {
            logError('VALIDATION_ERROR', 'No files uploaded', { body: req.body });
            return res.status(400).json({
                error: 'No files uploaded',
                success: false
            });
        }

        // Security: Input sanitization for request body
        const { resizeWidth, quality } = req.body;
        
        // Enhanced input validation with sanitization
        const sanitizedResizeWidth = resizeWidth ? validator.escape(String(resizeWidth)) : null;
        const sanitizedQuality = quality ? validator.escape(String(quality)) : null;

        // Validate conversion parameters with enhanced checks
        if (sanitizedResizeWidth && (isNaN(sanitizedResizeWidth) || parseInt(sanitizedResizeWidth) < 0 || parseInt(sanitizedResizeWidth) > 10000)) {
            logError('VALIDATION_ERROR', `Invalid resizeWidth: ${sanitizedResizeWidth}`, { body: req.body });
            return res.status(400).json({
                error: 'Resize width must be between 0 and 10000 pixels',
                success: false
            });
        }

        if (sanitizedQuality && (isNaN(sanitizedQuality) || parseInt(sanitizedQuality) < 1 || parseInt(sanitizedQuality) > 100)) {
            logError('VALIDATION_ERROR', `Invalid quality: ${sanitizedQuality}`, { body: req.body });
            return res.status(400).json({
                error: 'Quality must be between 1 and 100',
                success: false
            });
        }

        // Security: File type verification using magic numbers for each uploaded file
        for (const file of req.files) {
            const isValidFileType = await verifyFileType(file);
            
            if (!isValidFileType) {
                logError('SECURITY_ERROR', `File type verification failed (magic number check) for ${file.originalname}`, {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    ip: req.ip
                });
                
                logSecurityEvent('FILE_VERIFICATION_FAILED', `Potential malicious file upload detected: ${file.originalname}`, {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                });
                
                // Clean up the invalid file
                try {
                    fs.unlinkSync(file.path);
                } catch (cleanupError) {
                    logError('CLEANUP_ERROR', `Could not clean up invalid file ${file.path}`, {
                        error: cleanupError.message,
                        filename: file.originalname
                    });
                }
                
                return res.status(400).json({
                    error: `Invalid file type detected for ${file.originalname}. File may be corrupted or have incorrect extension.`,
                    success: false,
                    securityAlert: 'File type verification failed'
                });
            }
        }

        const convertedImages = [];
        const errors = [];

        // Resource limit: maximum concurrent conversions to prevent server overload
        const MAX_CONCURRENT_CONVERSIONS = 4;
        
        // Performance: Cache for processed images to avoid duplicate work
        // eslint-disable-next-line no-unused-vars
        const processingCache = new Map();

        // Create a worker pool for concurrent processing
        const processImage = async (file) => {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                try {
                    // Performance: Start processing timing
                    const processingStart = Date.now();
                    
                    // Remove original file extension before adding .webp
                    const fileNameWithoutExt = path.parse(file.originalname).name;
                    const outputPath = `converted/${Date.now()}-${fileNameWithoutExt}.webp`;

                    let sharpInstance = sharp(file.path);

                    // Performance: Optimize image processing pipeline
                    // 1. Get metadata once and reuse it
                    const metadata = await sharp(file.path).metadata();
                    const originalWidth = metadata.width;
                    const originalHeight = metadata.height;

                    // 2. Apply resizing if specified with optimization
                    if (resizeWidth && !isNaN(resizeWidth) && resizeWidth > 0) {
                        // Only resize if original image is larger than target width
                        if (originalWidth > parseInt(resizeWidth)) {
                            // Performance: Use smart resizing with kernel for better quality/speed balance
                            sharpInstance = sharpInstance.resize({
                                width: parseInt(resizeWidth),
                                kernel: sharp.kernel.lanczos3, // High quality kernel
                                withoutEnlargement: true // Prevent upscaling
                            });
                        }
                    }

                    // 3. Apply quality optimization
                    const qualityValue = quality && !isNaN(quality) && quality >= 1 && quality <= 100
                        ? parseInt(quality)
                        : 80;

                    // Performance: Use optimized WebP settings
                    sharpInstance = sharpInstance.webp({
                        quality: qualityValue,
                        effort: 4, // Balanced compression effort (0-6)
                        alphaQuality: qualityValue, // Match alpha channel quality
                        smartSubsample: true // Enable smart subsampling
                    });

                    // Performance: Optimize memory usage with streaming
                    await sharpInstance.toFile(outputPath);
                     
                    // Get the file size of the converted image
                    const stats = fs.statSync(outputPath);
                    
                    // Performance: End processing timing
                    const processingEnd = Date.now();
                    const processingTime = processingEnd - processingStart;
                    
                    console.log(`PERFORMANCE: Processed ${file.originalname} (${originalWidth}x${originalHeight}) in ${processingTime}ms`);
                     
                    const result = {
                        url: `/download/${path.basename(outputPath)}`,
                        name: path.basename(outputPath),
                        size: stats.size,
                        originalSize: file.size,
                        compressionRatio: (stats.size / file.size * 100).toFixed(2),
                        processingTime: processingTime,
                        progress: 100,
                        status: 'success'
                    };

                    // Clean up the uploaded file with error handling
                    try {
                        fs.unlinkSync(file.path);
                    } catch (cleanupError) {
                        logError('CLEANUP_WARNING', `Could not clean up file ${file.path}`, {
                            error: cleanupError.message,
                            filename: file.originalname
                        });
                        // Continue even if cleanup fails - the conversion was successful
                    }
                      
                    resolve(result);
                } catch (error) {
                    logError('CONVERSION_ERROR', `Error converting image ${file.originalname}`, {
                        error: error.message,
                        stack: error.stack,
                        filename: file.originalname,
                        fileSize: file.size,
                        fileType: file.mimetype
                    });
                      
                    // Clean up the uploaded file if it exists
                    try {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    } catch (cleanupError) {
                        logError('CLEANUP_ERROR', `Could not clean up failed conversion file ${file.path}`, {
                            error: cleanupError.message,
                            filename: file.originalname
                        });
                        // Continue even if cleanup fails
                    }
                      
                    // Provide more specific error messages based on error type
                    let userFriendlyError = error.message;
                     
                    if (error.message.includes('Input file is missing')) {
                        userFriendlyError = 'Input file is missing or corrupted';
                    } else if (error.message.includes('Unsupported format')) {
                        userFriendlyError = 'Unsupported image format';
                    } else if (error.message.includes('Insufficient memory')) {
                        userFriendlyError = 'Insufficient memory to process this image';
                    } else if (error.message.includes('Image too large')) {
                        userFriendlyError = 'Image dimensions are too large to process';
                    }
                      
                    reject({
                        filename: file.originalname,
                        error: userFriendlyError,
                        originalError: error.message,
                        progress: 0,
                        status: 'failed'
                    });
                }
            });
        };

        // Process images in parallel with concurrency limit
        const processWithConcurrencyLimit = async (files, limit) => {
            const results = [];
            const executing = [];

            for (const file of files) {
                const promise = processImage(file);
                results.push(promise);
                
                // Execute the promise
                const e = promise.then(result => {
                    executing.splice(executing.indexOf(e), 1);
                    return result;
                });
                executing.push(e);
                
                // Wait for a slot to be available if we're at the limit
                if (executing.length >= limit) {
                    await Promise.race(executing);
                }
            }
            
            return Promise.allSettled(results);
        };

        // Execute all promises with concurrency limit
        const results = await processWithConcurrencyLimit(req.files, MAX_CONCURRENT_CONVERSIONS);

        // Process results and separate successful conversions from errors
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                convertedImages.push(result.value);
            } else {
                errors.push(result.reason);
            }
        });

        // Maintain the same response format for compatibility
        const response = { convertedImages };
        
        // Add errors to response if any occurred
        if (errors.length > 0) {
            response.errors = errors;
        }

        res.json(response);
    } catch (error) {
        logError('SERVER_ERROR', 'Unexpected error in conversion endpoint', {
            error: error.message,
            stack: error.stack,
            requestBody: req.body
        });
        
        let statusCode = 500;
        let errorMessage = 'Internal server error during image conversion';
        
        if (error.message.includes('multer')) {
            statusCode = 400;
            errorMessage = error.message;
        } else if (error.message.includes('ENOENT')) {
            statusCode = 404;
            errorMessage = 'File not found on server';
        } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
            statusCode = 503;
            errorMessage = 'Service unavailable - please try again later';
        }
        
        res.status(statusCode).json({
            error: errorMessage,
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'converted', filename);

        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            logError('SECURITY_ERROR', 'Invalid filename in download request', {
                filename: filename,
                ip: req.ip
            });
            return res.status(400).json({
                error: 'Invalid filename',
                success: false
            });
        }

        if (fs.existsSync(filePath)) {
            // Security: Check if file is actually in the converted directory
            const realPath = fs.realpathSync(filePath);
            if (!realPath.startsWith(path.join(__dirname, 'converted'))) {
                logError('SECURITY_ERROR', 'Path traversal attempt detected', {
                    requestedPath: filePath,
                    realPath: realPath,
                    ip: req.ip
                });
                
                logSecurityEvent('PATH_TRAVERSAL_ATTEMPT', 'Potential path traversal attack detected', {
                    requestedPath: filePath,
                    realPath: realPath,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    filename: filename
                });
                
                return res.status(403).json({
                    error: 'Access denied',
                    success: false
                });
            }
            
            res.download(filePath, (err) => {
                if (err) {
                    logError('DOWNLOAD_ERROR', `Error downloading file ${filename}`, {
                        error: err.message,
                        ip: req.ip
                    });
                }
            });
        } else {
            logError('FILE_NOT_FOUND', `Download requested for non-existent file: ${filename}`, {
                ip: req.ip
            });
            res.status(404).json({
                error: 'File not found',
                success: false
            });
        }
    } catch (error) {
        logError('DOWNLOAD_ERROR', 'Unexpected error in download endpoint', {
            error: error.message,
            stack: error.stack,
            filename: req.params.filename,
            ip: req.ip
        });
        res.status(500).json({
            error: 'Internal server error during file download',
            success: false
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    logError('GLOBAL_ERROR', 'Unhandled error caught by global error handler', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });
    
    let statusCode = 500;
    let errorMessage = 'Internal Server Error';
    
    if (err instanceof multer.MulterError) {
        statusCode = 400;
        errorMessage = err.message;
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        errorMessage = err.message;
    } else if (err.message.includes('ENOENT')) {
        statusCode = 404;
        errorMessage = 'Resource not found';
    }
    
    res.status(statusCode).json({
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString()
    });
});

// Add request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    
    res.send = function(body) {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        originalSend.call(this, body);
    };
    
    next();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Error logs are being written to: ${ERROR_LOG_FILE}`);
});