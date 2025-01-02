// routes/appointments.ts
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

router.use(auth);

router.get('/availability', getDoctorAvailability);

router.post('/', createAppointment);

router.get('/', getAppointments);

router.get('/:id', getAppointmentById);

router.patch('/:id', updateAppointment);

export default router;
