// backend/src/controllers/dicom.controller.ts
import { DicomService, DicomFile } from '@/services/dicom.service';
import { Request, Response } from 'express';
import { MedicalFile } from '@models/MedicalFile';
import { User } from '@models/User';
import { generateFilePath } from '../config/supabase';
import mongoose from 'mongoose';

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
  return {
    lastModified: Date.now(),
    name: multerFile.originalname,
    size: multerFile.size,
    type: multerFile.mimetype,
    webkitRelativePath: multerFile.webkitRelativePath,
    arrayBuffer: async (): Promise<ArrayBuffer> => {
      const buffer = new ArrayBuffer(multerFile.buffer.length);
      new Uint8Array(buffer).set(new Uint8Array(multerFile.buffer));
      return buffer;
    },
    slice: (start?: number, end?: number, contentType?: string) => {
      const buffer = multerFile.buffer.slice(start, end);
      return new Blob([buffer], { type: contentType || multerFile.mimetype });
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
    const dicomFiles = multerFiles.map(convertToDigomFile);
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

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
        const folderPath = file.webkitRelativePath.split('/').slice(0, -1).join('/');
        const filePath = generateFilePath(userId, 'dicom', file.webkitRelativePath);

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
