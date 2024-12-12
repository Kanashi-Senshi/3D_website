// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export type FileType = 'stl' | 'dicom' | 'post-image';

// Helper function to generate a unique file path
export const generateFilePath = (userId: string, fileType: FileType, fileName: string) => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `${fileType}/${userId}/${timestamp}_${cleanFileName}`;
};

// Helper to get file extension
export const getFileExtension = (fileName: string): string => {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

// Validate file type
export const isValidFileType = (fileType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(fileType.toLowerCase());
};

// Get bucket name based on file type
export const getBucketName = (fileType: FileType): string => {
  switch (fileType) {
    case 'stl':
    case 'dicom':
      return 'medical-files';
    case 'post-image':
      return 'social-images';
    default:
      throw new Error('Invalid file type');
  }
};

// Get signed URL for file download
export const getSignedUrl = async (filePath: string, bucketName: string = 'medical-files') => {
  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
};

// Upload file to Supabase
export const uploadFile = async (
  filePath: string,
  fileBuffer: Buffer,
  contentType: string,
  fileType: FileType
) => {
  const bucketName = getBucketName(fileType);
  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType,
      cacheControl: '3600'
    });

  if (error) throw error;
  return data;
};