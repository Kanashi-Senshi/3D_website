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

export type FileType = 'stl' | 'dicom' | 'post-image' | '';

export const generateFilePath = (userId: string, fileType: FileType, fileName: string) => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `${fileType}/${userId}/${timestamp}_${cleanFileName}`;
};

export const getFileExtension = (fileName: string): string => {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

export const isValidFileType = (fileType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(fileType.toLowerCase());
};

export const getBucketName = (fileType: FileType): string => {
  switch (fileType) {
    case 'stl':
    case 'dicom':
      return 'medical-files';
    case '':
      return 'medical-files';
    case 'post-image':
      return 'social-images';
    default:
      throw new Error('Invalid file type');
  }
};

export const getSignedUrl = async (filePath: string, bucketName: string = 'medical-files') => {
  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
};

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

export function testSupabaseConnection() {
  return new Promise(async (resolve) => {
    try {
      console.log('Testing Supabase connection...');
      
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketError) {
        console.error('❌ Bucket listing failed:', bucketError.message);
        resolve(false);
        return;
      }
      
      console.log('✅ Successfully connected to Supabase');
      console.log('Available buckets:', buckets.map(b => b.name));

      const { data: files, error: filesError } = await supabase
        .storage
        .from('medical-files')
        .list();

      if (filesError) {
        console.error('❌ Medical files bucket access failed:', filesError.message);
        resolve(false);
        return;
      }

      console.log('✅ Successfully accessed medical-files bucket');
      resolve(true);
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      resolve(false);
    }
  });
}