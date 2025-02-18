// backend/src/controllers/file.controller.ts
import { Request, Response } from 'express';
import { MedicalFile } from '@models/MedicalFile';
import { User } from '@models/User';
import { FileDocument } from '../types/express';
import { supabase, generateFilePath, getFileExtension, isValidFileType, getSignedUrl } from '@/config/supabase';

const ALLOWED_STL_TYPES = ['stl'];
const ALLOWED_DICOM_TYPES = ['dcm', 'dicom', ''];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { patientId, fileType, tags } = req.body;
    const file = req.file;

    if (!file || !req.userId) {
      return res.status(400).json({ error: 'No file provided or user not authenticated' });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File size exceeds limit' });
    }

    const extension = getFileExtension(file.originalname);
    const allowedTypes = fileType === 'stl' ? ALLOWED_STL_TYPES : ALLOWED_DICOM_TYPES;
    
    if (!isValidFileType(extension, allowedTypes)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const filePath = generateFilePath(req.userId, fileType, file.originalname);

    const { error: uploadError } = await supabase
      .storage
      .from('medical-files')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const medicalFile = new MedicalFile({
      fileName: file.originalname,
      fileType,
      filePath,
      uploadedBy: req.userId,
      patient: patientId,
      size: file.size,
      tags: tags || [],
      status: fileType === 'dicom' ? 'processing' : 'completed'
    });

    await medicalFile.save();

    if (fileType === 'dicom') {
    }

    return res.status(201).json(medicalFile);
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { fileType, patientId, status } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query: any = {};

    if (fileType) {
      query.fileType = fileType;
    }

    if (status) {
      query.status = status;
    }

    if (user.role === 'doctor') {
      if (patientId) {
        query.patient = patientId;
      }
      query.$or = [
        { uploadedBy: user._id },
        { sharedWith: user._id }
      ];
    } else {
      query.patient = user._id;
    }

    const files = await MedicalFile.find(query)
      .populate('uploadedBy', 'name email')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    const filesWithUrls = await Promise.all(files.map(async (file) => {
      const fileObj = file.toObject() as FileDocument;
      fileObj.fileUrl = await getSignedUrl(file.filePath);
      if (file.segmentedFilePath) {
        fileObj.segmentedFileUrl = await getSignedUrl(file.segmentedFilePath);
      }
      return fileObj;
    }));

    return res.json(filesWithUrls);
  } catch (error) {
    console.error('Get files error:', error);
    return res.status(500).json({ error: 'Error fetching files' });
  }
};

export const getFileById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const file = await MedicalFile.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('patient', 'name email')
      .populate('sharedWith', 'name email');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.hasAccess(userId)) {
      return res.status(403).json({ error: 'Not authorized to access this file' });
    }

    const fileObj = file.toObject() as FileDocument;
    fileObj.fileUrl = await getSignedUrl(file.filePath);
    if (file.segmentedFilePath) {
      fileObj.segmentedFileUrl = await getSignedUrl(file.segmentedFilePath);
    }

    return res.json(fileObj);
  } catch (error) {
    console.error('Get file error:', error);
    return res.status(500).json({ error: 'Error fetching file' });
  }
};

export const updateFile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { notes, tags, status } = req.body;
    const file = await MedicalFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.hasAccess(userId)) {
      return res.status(403).json({ error: 'Not authorized to update this file' });
    }

    if (notes) await file.addNote(notes);
    if (tags) await file.addTags(tags);
    if (status && userId === file.uploadedBy.toString()) {
      file.status = status;
      await file.save();
    }

    return res.json(file);
  } catch (error) {
    console.error('Update file error:', error);
    return res.status(500).json({ error: 'Error updating file' });
  }
};

export const shareFile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { userIds } = req.body;
    const file = await MedicalFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (userId !== file.uploadedBy.toString() && 
        userId !== file.patient.toString()) {
      return res.status(403).json({ error: 'Not authorized to share this file' });
    }

    const users = await User.find({
      _id: { $in: userIds },
      role: 'doctor'
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({ error: 'One or more invalid user IDs' });
    }

    await file.shareWith(userIds);
    return res.json(file);
  } catch (error) {
    console.error('Share file error:', error);
    return res.status(500).json({ error: 'Error sharing file' });
  }
};
