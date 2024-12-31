// backend/models/Appointment.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  dateTime: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);