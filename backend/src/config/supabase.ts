// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {v5 as uuidv5} from 'uuid';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

//Consistent namespace UUID for converrting MongoDB IDs to UUIDs
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

//convert MongoDB ID to UUID
const mongoIdToUuid = (id: string): string => {
  return uuidv5(id, NAMESPACE);
};

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export type FileType = 'stl' | 'dicom' | 'post-image' | '';

export const generateFilePath = (userId: string, fileType: FileType, fileName: string) => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `${userId}/${fileType}/${timestamp}_${cleanFileName}`;
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

export const createSupabaseClient = (token?: string) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  if (token) {
    try {
      // Decode express JWT
      const decoded = jwt.decode(token) as any;
      
      if (!decoded) {
        throw new Error('Invalid token format');
      }

      const supabaseUUID = mongoIdToUuid(decoded.userId);
      // Create Supabase compatible JWT with required claims
      const supabaseToken = jwt.sign({
        sub: supabaseUUID, // Required: unique user identifier
        iss: process.env.SUPABASE_URL, // Required: your Supabase project URL
        aud: process.env.SUPABASE_URL, // Required: your Supabase project URL
        role: 'authenticated', // Required: user role
        exp: decoded.exp,
        iat: decoded.iat || Math.floor(Date.now() / 1000),
        email: decoded.email || '',
        user_metadata: {
          id: decoded.userId,
          email: decoded.email
        },
        app_metadata: {
          provider: 'email',
          role: 'authenticated'
        }
      }, process.env.SUPABASE_JWT_SECRET!, {
        algorithm: 'HS256'
      });

      // Set auth on the Supabase client instance
      supabase.auth.setSession({
        access_token: supabaseToken,
        refresh_token: '' // Supabase requires this field but not using refresh functionality
      });

    } catch (err) {
      console.error('Error creating Supabase session:', err);
    }
  }

  return supabase;
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
      /* console.log('Testing Supabase connection...'); */
      
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketError) {
        console.error('❌ Bucket listing failed:', bucketError.message);
        resolve(false);
        return;
      }
      
      /* console.log('✅ Successfully connected to Supabase'); */
      /* console.log('Available buckets:', buckets.map(b => b.name)); */

      const { data: files, error: filesError } = await supabase
        .storage
        .from('medical-files')
        .list();

      if (filesError) {
        console.error('❌ Medical files bucket access failed:', filesError.message);
        resolve(false);
        return;
      }

      /* console.log('✅ Successfully accessed medical-files bucket'); */
      resolve(true);
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      resolve(false);
    }
  });
}