// routes/appointments.ts
// backend/src/routes/appointments.ts
// backend/src/routes/appointments.ts
// backend/src/routes/appointments.ts
import express from 'express';
import { auth, doctorOnly } from '@middleware/auth';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  getDoctorAvailability
} from '@controllers/appointment.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get doctor's availability (public for authenticated users)
router.get('/availability', getDoctorAvailability);

// Create appointment
router.post('/', createAppointment);

// Get all appointments (filtered by user role)
router.get('/', getAppointments);

// Get specific appointment
router.get('/:id', getAppointmentById);

// Update appointment
router.patch('/:id', updateAppointment);

export default router;
