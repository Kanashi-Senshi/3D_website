// backend/models/User.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'doctor' | 'patient';
  profilePicture?: string;
  specialization?: string;
  licenseNumber?: string;
  patients?: Types.ObjectId[];
  doctors?: Types.ObjectId[];
  teams?: Types.ObjectId[];
  following?: Types.ObjectId[];
  followers?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  profilePicture: {
    type: String,
    default: ""
  },
  specialization: {
    type: String,
    default: ""
  },
  licenseNumber: {
    type: String,
    default: ""
  },
  patients: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  doctors: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team',
    default: []
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
}, {
  timestamps: true // This automatically handles createdAt and updatedAt
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

