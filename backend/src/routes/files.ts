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

router.use(auth);

router.post(
  '/upload',
  doctorOnly,
  upload.single('file'),
  uploadFile
);

router.get('/', getFiles);

router.get('/:id', getFileById);

router.patch('/:id', updateFile);

router.post('/:id/share', doctorOnly, shareFile);

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
