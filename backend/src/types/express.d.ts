// backend/src/types/express.d.ts
import { IMedicalFile } from '@models/MedicalFile';
import { Request } from 'express';
import { Multer } from 'multer';
import { SupabaseClient } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      supabase?: SupabaseClient;
      supabaseUser?: any;
      user?: any;
      userId: string;
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
