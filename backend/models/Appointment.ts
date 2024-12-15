// backend/models/Appointment.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  dateTime: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'consultation' | 'followup' | 'emergency';
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
    default: 30 // default 30 minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation', 'followup', 'emergency'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ doctor: 1, dateTime: 1 });
appointmentSchema.index({ patient: 1, dateTime: 1 });

// Validate that appointment times don't overlap for a doctor
appointmentSchema.pre('save', async function(next) {
  if (this.isModified('dateTime') || this.isModified('duration')) {
    const startTime = new Date(this.dateTime);
    const endTime = new Date(startTime.getTime() + this.duration * 60000);

    const overlapping = await mongoose.model('Appointment').findOne({
      doctor: this.doctor,
      _id: { $ne: this._id },
      status: { $ne: 'cancelled' },
      dateTime: {
        $lt: endTime,
        $gt: startTime
      }
    });

    if (overlapping) {
      throw new Error('Appointment time conflicts with an existing appointment');
    }
  }
  next();
});

// Virtual for end time
appointmentSchema.virtual('endTime').get(function() {
  return new Date(this.dateTime.getTime() + this.duration * 60000);
});

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
