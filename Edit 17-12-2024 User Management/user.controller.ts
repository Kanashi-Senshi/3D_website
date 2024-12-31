// backend/src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { User } from '@models/User';
import { Appointment } from '@models/Appointment';
import { MedicalFile } from '@models/MedicalFile';
import { Team } from '@models/Team';
import { Post } from '@models/Post';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get role-specific data
    let dashboardData: any = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    if (user.role === 'doctor') {
      // Get doctor-specific data
      const patients = await User.find({ 
        _id: { $in: await Appointment.distinct('patient', { doctor: userId }) }
      });
      
      dashboardData.stats = {
        totalPatients: patients.length,
        totalAppointments: await Appointment.countDocuments({ doctor: userId }),
        totalFiles: await MedicalFile.countDocuments({ uploadedBy: userId })
      };
    } else {
      // Get patient-specific data
      const doctors = await User.find({
        _id: { $in: await Appointment.distinct('doctor', { patient: userId }) }
      });

      dashboardData.stats = {
        totalDoctors: doctors.length,
        totalAppointments: await Appointment.countDocuments({ patient: userId }),
        totalFiles: await MedicalFile.countDocuments({ patient: userId })
      };
    }

    return res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return res.status(500).json({ error: 'Error fetching dashboard data' });
  }
};

// Add this to routes/user.ts
router.get('/:userId/dashboard', auth, getDashboardData);