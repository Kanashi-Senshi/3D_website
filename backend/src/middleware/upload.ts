// middleware/upload.ts
// backend/src/middleware/upload.ts
// backend/src/middleware/upload.ts
// backend/src/middleware/upload.ts
import multer from 'multer';

const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow STL and DICOM files
  if (file.mimetype === 'application/sla' || 
      file.mimetype === 'application/stl' ||
      file.mimetype === 'application/dicom' ||
      file.originalname.toLowerCase().endsWith('.stl') ||
      file.originalname.toLowerCase().endsWith('.dcm') ||
      file.originalname.toLowerCase().endsWith('.dicom')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});
