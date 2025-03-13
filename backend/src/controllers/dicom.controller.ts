// backend/src/controllers/dicom.controller.ts
import { DicomService, DicomFile } from '@/services/dicom.service';
import { Request, Response } from 'express';
import { MedicalFile } from '@models/MedicalFile';
import { User } from '@models/User';
import { generateFilePath, createSupabaseClient } from '../config/supabase';
import mongoose, { mongo } from 'mongoose';
import fs, { write } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { auth } from '@/middleware/auth';
import { times } from 'lodash';
import { createClient } from '@supabase/supabase-js';

interface ExtendedFile extends Express.Multer.File {
  webkitRelativePath: string;
}

interface FileInfo {
  id: string;
  name: string;
  size: number;
  status: string;
  uploadDate: Date;
}

interface FolderStructure{
  [path: string]: FileInfo[];
}

// Type guard to validate DicomFile properties
const isDicomFile = (file: any): file is DicomFile => {
  return file &&
    typeof file.name === 'string' &&
    typeof file.webkitRelativePath === 'string' &&
    file.type !== undefined &&
    typeof file.arrayBuffer === 'function' &&
    typeof file.slice === 'function' &&
    typeof file.stream === 'function' &&
    typeof file.text === 'function';
};


// Convert Multer file to DicomFile
const convertToDigomFile = (multerFile: ExtendedFile): DicomFile => {
  const filePath = multerFile.webkitRelativePath || multerFile.originalname; 
  return {
    lastModified: Date.now(),
    name: multerFile.originalname,
    size: multerFile.size,
    type: multerFile.mimetype,
    webkitRelativePath: filePath,
    arrayBuffer: async (): Promise<ArrayBuffer> => {
      const buffer = new ArrayBuffer(multerFile.buffer.length);
      new Uint8Array(buffer).set(new Uint8Array(multerFile.buffer));
      return buffer;
    },
    slice: (start?: number, end?: number, contentType?: string) => {
      const slicedBuffer = Buffer.from(multerFile.buffer).subarray(start || 0, end);
      return new Blob([slicedBuffer], { type: contentType || multerFile.mimetype });
    },
    stream: () => new ReadableStream({
      start(controller) {
        controller.enqueue(multerFile.buffer);
        controller.close();
      }
    }),
    text: async () => multerFile.buffer.toString('utf-8'),
    bytes: async () => new Uint8Array(multerFile.buffer)
  };
};

export const uploadDicomFiles = async (req: Request, res: Response): Promise<Response | void> => {
  let sseConnection: Response | null = null;

  

  try {
         // Decode token to inspect claims
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    if (token) {
      try {
        const decoded = jwt.decode(token);
      } catch (err) {
        console.error('Token decode error:', err);
      }
    }
    const userId = req.userId;
    const { patientId } = req.body;


    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate patient exists if it's a registered patient
    // if (patientId) {
    //   const patient = await User.findById(patientId);
    //   if (!patient) {
    //     return res.status(404).json({ error: 'Patient not found' });
    //   }
    // }

    // Setup SSE for progress tracking if client supports it
    if (req.headers.accept?.includes('text/event-stream')) {
      sseConnection = res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      });
    }

    const multerFiles = req.files as ExtendedFile[];
    const paths = req.body.paths;

    multerFiles.forEach((file, index) => {
      Object.defineProperty(file, 'webkitRelativePath', {
        value: Array.isArray(paths) ? paths[index] : paths,
        writable: false
      });
    });
    
    // console.log('Raw multerFiles:', {
    //   count: multerFiles?.length || 0,
    //   firstFile: multerFiles?.[0] ? {
    //     originalname: multerFiles[0].originalname,
    //     filename: multerFiles[0].fieldname,
    //     size: multerFiles[0].size,
    //     path: multerFiles[0].webkitRelativePath,
    //     // Log all properties of the first file
    //     allProps: Object.keys(multerFiles[0]),
    //     buffer: multerFiles[0].buffer ? 'Buffer exists' : 'No buffer',
    //   } : 'No files'
    // });

    // console.log('Received files:', multerFiles.map(file => ({
    //   name: file.originalname,
    //   size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    //   path: file.webkitRelativePath
    // })));

    // Track memory usage
    const memoryUsage = process.memoryUsage();
    /* console.log('Memory usage during upload:', {
      heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
    }); */

    // Add error handler for request
    req.on('error', (error) => {
      console.error('Upload request error:', error);
    });

    // Add error handler for response
    res.on('error', (error) => {
      console.error('Upload response error:', error);
    });

    const dicomFiles = multerFiles.map(convertToDigomFile);

    /* console.log('*****Token value:', token); */

    // Initialize DICOM service with progress tracking
    const dicomService = new DicomService(
      process.env.API_URL || 'http://localhost:5000',
      token,
      (progress) => {
        if (sseConnection) {
          sseConnection.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      }
    );

    
    // Upload files and maintain folder structure
    const result = await dicomService.uploadDicomFolder(dicomFiles, patientId);
    if (!result.success) {
      throw new Error(result.error);
    }

    // Create medical file records with folder structure
    const medicalFiles = await Promise.all(
      dicomFiles.map(async (file) => {
        const relativePath = file.webkitRelativePath || file.name;
        const pathParts = relativePath.split('/');
        const folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : '';
        const filePath = generateFilePath(userId, 'dicom', file.webkitRelativePath);

        console.log('relativePath:', relativePath);
        console.log('folderPath:', folderPath);
        console.log('filePath:', filePath);

        const medicalFile = new MedicalFile({
          fileName: file.name,
          fileType: 'dicom',
          filePath,
          folderPath,
          uploadedBy: userId,
          patient: patientId,
          size: file.size,
          status: 'processing',
          notes: [],
          tags: ['DICOM'],
          sharedWith: []
        });

        return medicalFile.save();
      })
    );

    // Send final success response
    const response = {
      success: true,
      message: 'DICOM files uploaded successfully',
      totalFiles: dicomFiles.length,
      totalSize: dicomFiles.reduce((acc, file) => acc + file.size, 0),
      files: medicalFiles.map(file => ({
        id: file._id,
        name: file.fileName,
        path: file.folderPath,
        size: file.size,
        status: file.status
      }))
    };

    if (sseConnection) {
      sseConnection.write(`data: ${JSON.stringify({ ...response, type: 'complete' })}\n\n`);
      sseConnection.end();
    } else {
      return res.status(201).json(response);
    }

  } catch (error) {
    console.error('DICOM upload error:', error);

    const errorResponse = {
      error: 'Error uploading DICOM files',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.headers['X-Request-ID']
    };

    if (sseConnection) {
      sseConnection.write(`data: ${JSON.stringify({ ...errorResponse, type: 'error' })}\n\n`);
      sseConnection.end();
    } else {
      return res.status(500).json(errorResponse);
    }
  }
};

export const getDicomOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Parse status filter
    let statusFilter: string[] = [];
    if (status === 'current') {
      statusFilter = ['PENDING', 'IN_PROGRESS'];
    } else if (status === 'completed') {
      statusFilter = ['COMPLETED'];
    }

    // Get files with folder structure
    const files = await MedicalFile.aggregate([
      {
        $match: {
          uploadedBy: new mongoose.Types.ObjectId(userId),
          status: { $in: statusFilter }
        }
      },
      {
        $group: {
          _id: '$folderPath',
          files: { $push: '$$ROOT' },
          totalSize: { $sum: '$size' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    return res.json({
      success: true,
      folders: files.map(folder => ({
        path: folder._id,
        fileCount: folder.count,
        totalSize: folder.totalSize,
        files: folder.files.map((file: { _id: string; fileName: string; size: number; status: string; createdAt: Date }) => ({
          id: file._id,
          name: file.fileName,
          size: file.size,
          status: file.status,
          uploadDate: file.createdAt
        }))
      }))
    });

  } catch (error) {
    console.error('Get DICOM orders error:', error);
    return res.status(500).json({
      error: 'Error fetching DICOM orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.headers['X-Request-ID']
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, progress } = req.body as {
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      progress: number;
    };
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update all files in the order
    const updateResult = await MedicalFile.updateMany(
      { 
        orderId,
        uploadedBy: userId
      },
      {
        $set: {
          status,
          'processingProgress.current': progress,
          'processingProgress.updatedAt': new Date()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      success: true,
      message: 'Order status updated successfully',
      status: { state: status, progress }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ 
      error: 'Error updating order status',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.headers['X-Request-ID']
    });
  }
};

export const addCollaboratingDoctor = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { doctorId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate doctor exists and is actually a doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Add doctor to all files in the order
    const updateResult = await MedicalFile.updateMany(
      {
        orderId,
        uploadedBy: userId,
        collaboratingDoctors: { $ne: doctorId }
      },
      {
        $push: { collaboratingDoctors: doctorId },
        $set: { updatedAt: new Date() }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      success: true,
      message: 'Collaborating doctor added successfully',
      doctorName: doctor.name
    });

  } catch (error) {
    console.error('Add collaborating doctor error:', error);
    return res.status(500).json({ 
      error: 'Error adding collaborating doctor',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.headers['X-Request-ID']
    });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const files = await MedicalFile.find({ orderId, uploadedBy: userId })
      .populate('collaboratingDoctors', 'name email role')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    if (files.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get first file for order-level information
    const firstFile = files[0];

    const orderDetails = {
      orderId,
      patientInfo: firstFile.patient,
      status: firstFile.status,
      collaboratingDoctors: firstFile.sharedWith,
      createdAt: firstFile.createdAt,
      updatedAt: firstFile.updatedAt,
      folderStructure: files.reduce<FolderStructure>((acc, file) => {
        const path = file.folderPath || '/';
        if (!acc[path]) {
          acc[path] = [];
        }
        acc[path].push({
          id: file._id,
          name: file.fileName,
          size: file.size,
          status: file.status,
          uploadDate: file.createdAt
        });
        return acc;
      }, {} as Record<string, any[]>),
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0)
    };

    return res.json(orderDetails);

  } catch (error) {
    console.error('Get order details error:', error);
    return res.status(500).json({ 
      error: 'Error fetching order details',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.headers['X-Request-ID']
    });
  }
};

export const createFolderStructure = async (req: Request, res: Response) => {
  try {
    const { patientId, structure } = req.body;
    const userId = req.userId;

    /* console.log('Creating folder structure:', {
      patientId,
      structure,
      userId
    }); */

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!patientId || !structure || !Array.isArray(structure)) {
      return res.status(400).json({ 
        error: 'Invalid request body - patientId and structure array required' 
      });
    }

    // Create base folder records in MongoDB
    const folderPromises = structure.map(async (folderPath) => {
      const fileName = folderPath === '/' ? 'root' : folderPath.split('/').pop();
      const filePath = folderPath === '/' ? `/root/${userId}/${new Date().toISOString().replace(/[:.]/g, '-')}` : `${userId}/${patientId}/dicom/${new Date().toISOString().replace(/[:.]/g, '-')}_${fileName}`;
      
      /* console.log('Creating folder record:', { folderPath, fileName, filePath }); */
      
      const newFolder = new MedicalFile({
        fileName,
        fileType: 'dicom',
        folderPath,
        uploadedBy: userId,
        patient: patientId,
        size: 0,
        status: 'processing',
        isFolder: true,
        filePath
      });
    
      return newFolder.save();
    });

    await Promise.all(folderPromises);

    return res.status(201).json({
      success: true,
      message: 'Folder structure created successfully',
      structure
    });

  } catch (error) {
    console.error('Create folder structure error:', error);
    return res.status(500).json({ 
      error: 'Error creating folder structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateDicomStatus = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { status, progress } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const file = await MedicalFile.findOneAndUpdate(
      { 
        _id: fileId,
        uploadedBy: userId
      },
      {
        $set: {
          status,
          'processingProgress.current': progress,
          'processingProgress.updatedAt': new Date()
        }
      },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.json({
      success: true,
      file: {
        id: file._id,
        name: file.fileName,
        status: file.status,
        progress: progress
      }
    });

  } catch (error) {
    console.error('Update DICOM status error:', error);
    return res.status(500).json({
      error: 'Error updating DICOM status',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.headers['X-Request-ID']
    });
  }
};

export const handleChunkUpload = async (req: Request, res: Response) => {
  try {
    const { fileId, chunkIndex, totalChunks, patientId, relativePath } = req.body;
    const chunk = req.file;
    const userId = req.userId;
  
    const token = req.headers.authorization?.replace('Bearer ', '');
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    console.log('SupabaseAuth token details: ', {
      tokenPresent: !!token,
      prefix: token?.substring(0, 10)
    })
    const { data: {user}, error: userError } = await supabase.auth.getUser();
    console.log('Supabase user context:', user);
    // const accessToken = session?.access_token;

    // if (sessionError || !accessToken) {
    //   console.error('Failed to get session token:', sessionError);
    //   return res.status(401).json({ error: 'Invalid session token' });
    // }

    // supabase.auth.setSession({
    //   access_token: accessToken,
    //   refresh_token: ''
    // });

    /* console.log('Processing chunk upload:', {
      fileId,
      chunkIndex,
      totalChunks,
      chunkSize: chunk?.size
    }); */

    if (!chunk || !fileId || !userId) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Define base upload directories
    const baseDir = process.env.UPLOAD_BASE_DIR || path.join(process.cwd(), 'uploads');
    const tempDir = path.join(baseDir, 'temp', 'chunks');
    
    // Create temp directory if it doesn't exist
    await fs.promises.mkdir(tempDir, { recursive: true });

    // Save chunk to temporary storage
    const chunkPath = path.join(tempDir, `${fileId}_${chunkIndex}`);
    await fs.promises.writeFile(chunkPath, chunk.buffer);

    // If this is the last chunk, combine all chunks and upload
    if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
      /* console.log('Processing final chunk, combining file:', fileId); */
      
      // Combine chunks into single buffer
      const chunks: Buffer[] = [];
      for (let i = 0; i < parseInt(totalChunks); i++) {
        const currentChunkPath = path.join(tempDir, `${fileId}_${i}`);
        const chunkData = await fs.promises.readFile(currentChunkPath);
        chunks.push(chunkData);
        
        // Clean up chunk
        await fs.promises.unlink(currentChunkPath);
      }
      
      const completeFileBuffer = Buffer.concat(chunks);
      
      try {
        // Generate Supabase storage path
        const filePath = generateFilePath(userId, 'dicom', fileId);


        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('medical-files')
          .upload(filePath, completeFileBuffer, {
            contentType: 'application/dicom',
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        // Create MongoDB record
        const folderPath = path.dirname(relativePath);
        const medicalFile = new MedicalFile({
          fileName: path.basename(fileId),
          fileType: 'dicom',
          filePath,
          folderPath,
          uploadedBy: new mongoose.Types.ObjectId(userId),
          patient: patientId,
          size: completeFileBuffer.length,
          status: 'processing',
          isFolder: false
        });

        await medicalFile.save();

        /* console.log('File upload complete:', {
          fileName: fileId,
          supabasePath: filePath,
          size: completeFileBuffer.length
        }); */
      } catch (error) {
        console.error('Error uploading complete file:', error);
        throw error;
      }
    }

    return res.json({
      success: true,
      message: 'Chunk uploaded successfully',
      chunkIndex,
      totalChunks
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return res.status(500).json({
      error: 'Error processing chunk upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
