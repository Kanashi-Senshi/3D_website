// backend/src/controllers/user.controller.ts
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { User, IUser } from '@models/User';
import { Appointment } from '@models/Appointment';
import { MedicalFile } from '@models/MedicalFile';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    console.log('Fetching dashboard stats for user:', req.userId);
    
    if (!req.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User role:', user.role);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeFiles = await MedicalFile.countDocuments({
      [user.role === 'doctor' ? 'uploadedBy' : 'patient']: new mongoose.Types.ObjectId(req.userId),
      status: 'active'
    });

    const newFiles = await MedicalFile.countDocuments({
      [user.role === 'doctor' ? 'uploadedBy' : 'patient']: new mongoose.Types.ObjectId(req.userId),
      createdAt: { $gte: oneWeekAgo }
    });

    const appointments = await Appointment.countDocuments({
      [user.role === 'doctor' ? 'doctor' : 'patient']: new mongoose.Types.ObjectId(req.userId),
      dateTime: { $gte: now },
      status: { $ne: 'cancelled' }
    });

    const nextAppointment = await Appointment.findOne({
      [user.role === 'doctor' ? 'doctor' : 'patient']: new mongoose.Types.ObjectId(req.userId),
      dateTime: { $gte: now },
      status: { $ne: 'cancelled' }
    })
    .sort({ dateTime: 1 })
    .lean();

    const connectionsField = user.role === 'doctor' ? 'patients' : 'doctors';
    const connections = user[connectionsField]?.length || 0;

    const populatedUser = await User.findById(req.userId)
      .populate({
        path: connectionsField,
        match: { createdAt: { $gte: oneWeekAgo } }
      })
      .select(connectionsField);

    const newConnections = (populatedUser?.[connectionsField] as any[] || []).length;

    const recentActivity = [
      ...(nextAppointment ? [{
        id: nextAppointment._id.toString(),
        type: 'appointment',
        description: 'Upcoming appointment',
        time: nextAppointment.dateTime.toISOString(),
        icon: null // Frontend will handle icon
      }] : []),
      {
        id: 'stats',
        type: 'file',
        description: `${newFiles} new files this week`,
        time: new Date().toISOString(),
        icon: null
      }
    ];

    const dashboardData = {
      activeFiles,
      newFiles,
      appointments,
      connections,
      newConnections,
      nextAppointment: nextAppointment?.dateTime || null,
      recentActivity
    };

    console.log('Dashboard data:', dashboardData);
    
    return res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ 
      error: 'Error fetching dashboard stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addConnection = async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;
    const userId = req.userId;

    if (!connectionId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userObjectId = new Types.ObjectId(userId);
    const connectionObjectId = new Types.ObjectId(connectionId);

    const [user, connectionUser] = await Promise.all([
      User.findById(userObjectId),
      User.findById(connectionObjectId)
    ]);

    if (!user || !connectionUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === connectionUser.role) {
      return res.status(400).json({ error: 'Cannot connect users with the same role' });
    }

    if (user.role === 'doctor') {
      if (!user.patients?.includes(connectionObjectId)) {
        user.patients = [...(user.patients || []), connectionObjectId];
        connectionUser.doctors = [...(connectionUser.doctors || []), userObjectId];
      }
    } else {
      if (!user.doctors?.includes(connectionObjectId)) {
        user.doctors = [...(user.doctors || []), connectionObjectId];
        connectionUser.patients = [...(connectionUser.patients || []), userObjectId];
      }
    }

    await Promise.all([user.save(), connectionUser.save()]);

    return res.json({ message: 'Connection added successfully' });
  } catch (error) {
    console.error('Add connection error:', error);
    return res.status(500).json({ error: 'Error adding connection' });
  }
};

export const removeConnection = async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    if (!connectionId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userObjectId = new Types.ObjectId(userId);
    const connectionObjectId = new Types.ObjectId(connectionId);

    const [user, connectionUser] = await Promise.all([
      User.findById(userObjectId),
      User.findById(connectionObjectId)
    ]);

    if (!user || !connectionUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'doctor') {
      user.patients = user.patients?.filter(id => !id.equals(connectionObjectId)) || [];
      connectionUser.doctors = connectionUser.doctors?.filter(id => !id.equals(userObjectId)) || [];
    } else {
      user.doctors = user.doctors?.filter(id => !id.equals(connectionObjectId)) || [];
      connectionUser.patients = connectionUser.patients?.filter(id => !id.equals(userObjectId)) || [];
    }

    await Promise.all([user.save(), connectionUser.save()]);

    return res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Remove connection error:', error);
    return res.status(500).json({ error: 'Error removing connection' });
  }
