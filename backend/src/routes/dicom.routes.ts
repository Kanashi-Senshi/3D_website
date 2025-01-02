// backend/src/routes/dicom.routes.ts
import express from 'express';
import { auth, doctorOnly } from '../middleware/auth';
import multer from 'multer';
import {
  uploadDicomFiles,
  getDicomOrders,
  updateOrderStatus,
  addCollaboratingDoctor,
  getOrderDetails
} from '../controllers/dicom.controller';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/dicom' || 
        file.originalname.toLowerCase().endsWith('.dcm') ||
        file.originalname.toLowerCase().endsWith('.dicom')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit per file
    files: 10 // Maximum 10 files per upload
  }
});

router.use(auth);

router.post('/upload', doctorOnly, upload.array('files'), uploadDicomFiles);
router.post('/orders/:orderId/collaborators', doctorOnly, addCollaboratingDoctor);
router.patch('/orders/:orderId/status', doctorOnly, updateOrderStatus);

router.get('/orders', getDicomOrders);
router.get('/orders/:orderId', getOrderDetails);

router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        details: 'Maximum file size is 100MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        details: 'Maximum 10 files per upload'
      });
    }
  }

  console.error('DICOM route error:', error);
  return res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

