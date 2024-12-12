// types/express.d.ts
// backend/src/types/express.d.ts
// backend/src/types/express.d.ts
// backend/src/types/express.d.ts
import { IMedicalFile } from '@models/MedicalFile';
import { Request } from 'express';
import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      };
      files?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }[];
    }

    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }
    }
  }
}

export interface FileDocument extends IMedicalFile {
  fileUrl?: string;
  segmentedFileUrl?: string;
}
