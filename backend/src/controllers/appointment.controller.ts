// backend/src/controllers/appointment.controller.ts
import { Request, Response } from 'express';
import { Appointment } from '@models/Appointment';
import { User } from '@models/User';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, dateTime, duration, type, notes } = req.body;
    
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const appointment = new Appointment({
      doctor: doctorId,
      patient: req.userId, // from auth middleware
      dateTime: new Date(dateTime),
      duration,
      type,
      notes
    });

    await appointment.save();

    return res.status(201).json(appointment);
  } catch (error: any) {
    if (error.message === 'Appointment time conflicts with an existing appointment') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Create appointment error:', error);
    return res.status(500).json({ error: 'Error creating appointment' });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query: any = {
      dateTime: {}
    };

    if (startDate) {
      query.dateTime.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.dateTime.$lte = new Date(endDate as string);
    }

    if (status) {
      query.status = status;
    }

    if (user.role === 'doctor') {
      query.doctor = user._id;
    } else {
      query.patient = user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .sort({ dateTime: 1 });

    return res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    return res.status(500).json({ error: 'Error fetching appointments' });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.userId && 
        appointment.patient.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view this appointment' });
    }

    return res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    return res.status(500).json({ error: 'Error fetching appointment' });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.userId && 
        appointment.patient.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    if (status === 'cancelled' && appointment.dateTime < new Date()) {
      return res.status(400).json({ error: 'Cannot cancel past appointments' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();
    return res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ error: 'Error updating appointment' });
  }
};

export const getDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { doctorId, date } = req.query;
    
    const startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: doctorId,
      dateTime: {
        $gte: startDate,
        $lt: endDate
      },
      status: { $ne: 'cancelled' }
    }).select('dateTime duration');

    const busySlots = appointments.map(apt => ({
      start: apt.dateTime,
      end: new Date(apt.dateTime.getTime() + apt.duration * 60000)
    }));

    return res.json(busySlots);
  } catch (error) {
    console.error('Get availability error:', error);
    return res.status(500).json({ error: 'Error fetching availability' });
  }
};
