// routes/files.ts
// backend/src/routes/files.ts
import express from 'express';
import { auth, doctorOnly } from '@middleware/auth';
import { upload } from '@middleware/upload';
import {
  uploadFile,
  getFiles,
  getFileById,
  updateFile,
  shareFile
} from '@controllers/file.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Upload new file (doctors only)
router.post(
  '/upload',
  doctorOnly,
  upload.single('file'),
  uploadFile
);

// Get all files (filtered by user role and access)
router.get('/', getFiles);

// Get specific file
router.get('/:id', getFileById);

// Update file metadata
router.patch('/:id', updateFile);

// Share file with other users (doctors only)
router.post('/:id/share', doctorOnly, shareFile);

// Error handling middleware for multer
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error) {
    if (err.name === 'MulterError') {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    }
  }
  return next(err);
});

export default router;
