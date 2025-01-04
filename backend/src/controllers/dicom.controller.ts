// backend/src/controllers/dicom.controller.ts
import { Request, Response } from 'express';
import { MedicalFile, IMedicalFile } from '@models/MedicalFile';
import { User } from '@models/User';
import { uploadFile, generateFilePath } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

interface DicomOrderStatus {
  state: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
}

interface ExtendedIMedicalFile extends IMedicalFile {
  collaboratingDoctors?: mongoose.Types.ObjectId[];
  orderId?: string;
}

export const uploadDicomFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { patientId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    // For registered patients, validate they exist
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      const patient = await User.findById(patientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
    }

    // Create new order ID
    const orderId = uuidv4();

    // Process files and maintain folder structure
    const files = req.files as Express.Multer.File[];
    const folderStructure = new Map<string, Express.Multer.File[]>();

    files.forEach(file => {
      // Get the directory path from the originalname
      const pathParts = file.originalname.split('/');
      pathParts.pop(); // Remove the filename
      const dirPath = pathParts.join('/');

      if (!folderStructure.has(dirPath)) {
        folderStructure.set(dirPath, []);
      }
      folderStructure.get(dirPath)?.push(file);
    });

    // Process each folder
    const uploadPromises: Promise<any>[] = [];

    for (const [folderPath, folderFiles] of folderStructure.entries()) {
      for (const file of folderFiles) {
        const uploadPromise = (async () => {
          try {
            // Generate unique file path preserving folder structure
            const filePath = generateFilePath(userId.toString(), 'dicom', `${folderPath}/${file.originalname}`);

            // Upload to Supabase
            await uploadFile(filePath, file.buffer, file.mimetype, 'dicom');

            // Create medical file record
            const medicalFile = new MedicalFile({
              fileName: file.originalname,
              fileType: 'dicom',
              filePath,
              uploadedBy: userId,
              patient: patientId,
              size: file.size,
              orderId,
              status: 'processing',
              notes: [],
              tags: ['DICOM'],
              folderPath: folderPath,
              collaboratingDoctors: [] // Initialize empty array
            });

            return medicalFile.save();
          } catch (error) {
            console.error('File upload error:', error);
            throw error;
          }
        })();
        uploadPromises.push(uploadPromise);
      }
    }

    // Wait for all files to be processed
    await Promise.all(uploadPromises);

    return res.status(201).json({
      success: true,
      message: 'DICOM files uploaded successfully',
      orderId,
      status: 'processing',
      creationDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('DICOM upload error:', error);
    return res.status(500).json({ 
      error: 'Error uploading DICOM files',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


export const getDicomOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const userId = req.userId;

    // Parse status filter
    let statusFilter: string[] = [];
    if (status === 'current') {
      statusFilter = ['PENDING', 'IN_PROGRESS'];
    } else if (status === 'completed') {
      statusFilter = ['COMPLETED'];
    }

    // Aggregate orders
    const orders = await MedicalFile.aggregate([
      {
        $match: {
          uploadedBy: userId,
          'status.state': { $in: statusFilter }
        }
      },
      {
        $group: {
          _id: '$orderId',
          patientId: { $first: '$patient' },
          status: { $first: '$status' },
          collaboratingDoctors: { $first: '$collaboratingDoctors' },
          creationDate: { $first: '$createdAt' },
          lastUpdate: { $max: '$updatedAt' },
          fileCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'collaboratingDoctors',
          foreignField: '_id',
          as: 'doctorDetails'
        }
      },
      {
        $project: {
          orderId: '$_id',
          patientId: 1,
          status: 1,
          collaboratingDoctors: {
            $map: {
              input: '$doctorDetails',
              as: 'doctor',
              in: { $concat: ['Dr. ', '$doctor.name'] }
            }
          },
          fileCount: 1,
          creationDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$creationDate'
            }
          },
          lastUpdate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$lastUpdate'
            }
          }
        }
      },
      {
        $sort: { creationDate: -1 }
      }
    ]);

    return res.json(orders);

  } catch (error) {
    console.error('Get DICOM orders error:', error);
    return res.status(500).json({ 
      error: 'Error fetching DICOM orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, progress } = req.body as {
      status: DicomOrderStatus['state'];
      progress: number;
    };
    const userId = req.userId;

    // Validate status
    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
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
          'status.state': status,
          'status.progress': progress,
          updatedAt: new Date()
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
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addCollaboratingDoctor = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { doctorId } = req.body;
    const userId = req.userId;

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
      details: error instanceof Error ? error.message : 'Unknown error'
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
      .sort({ createdAt: -1 });

    if (files.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const firstFile = files[0] as ExtendedIMedicalFile;

    const orderDetails = {
      orderId,
      patientInfo: firstFile.patient,
      status: firstFile.status,
      collaboratingDoctors: firstFile.collaboratingDoctors || [],
      creationDate: firstFile.createdAt,
      lastUpdate: firstFile.updatedAt,
      files: files.map(file => ({
        fileName: file.fileName,
        size: file.size,
        uploadDate: file.createdAt
      }))
    };

    return res.json(orderDetails);

  } catch (error) {
    console.error('Get order details error:', error);
    return res.status(500).json({ 
      error: 'Error fetching order details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
