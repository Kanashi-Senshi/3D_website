// backend/src/middleware/dicomMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import crypto from 'crypto';

// Rate limiting configuration
export const dicomUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many uploads from this IP, please try again later'
});

// Multer configuration for handling large files
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB max file size
    files: 1000 // Max number of files
  },
  fileFilter: (_req, file, cb) => {
    // Check file extension
    if (file.originalname.match(/\.(dcm|dicom)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only DICOM files are allowed'));
    }
  }
});

// Security headers middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  next();
};

// Request validation middleware
export const validateDicomRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    // Check for required fields
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    // Validate files exist
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Generate request ID for tracking
    req.headers['X-Request-ID'] = crypto.randomUUID();

    next();
  } catch (error) {
    next(error);
  }
};

// Error handling middleware
export const handleDicomError = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error('DICOM Error:', error);

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          details: 'Maximum file size is 2GB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          details: 'Maximum 1000 files per upload'
        });
      default:
        return res.status(400).json({
          error: 'File upload error',
          details: error.message
        });
    }
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: error.message
    });
  }

  // Handle any other errors
  return res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
};

// Progress tracking middleware
export const trackUploadProgress = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.headers['content-length']) {
    return next();
  }

  const contentLength = parseInt(req.headers['content-length']);
  let bytesReceived = 0;

  req.on('data', (chunk: Buffer) => {
    bytesReceived += chunk.length;
    const progress = (bytesReceived / contentLength) * 100;

    // Emit progress through Server-Sent Events if configured
    if (res.locals.sseConnection) {
      res.locals.sseConnection.send({
        event: 'uploadProgress',
        data: {
          progress: Math.round(progress),
          bytes: bytesReceived,
          total: contentLength
        }
      });
    }
  });

  next();
};
