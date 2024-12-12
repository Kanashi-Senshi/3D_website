// models/User.ts
// backend/models/User.ts
// backend/models/User.ts
// backend/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'doctor' | 'patient';
  createdAt: Date;
  profilePicture?: string;
  specialization?: string;
  licenseNumber?: string;
  teams: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    required: function(this: IUser) { 
      return this.role === 'doctor';
    }
  },
  licenseNumber: {
    type: String,
    required: function(this: IUser) { 
      return this.role === 'doctor';
    }
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model<IUser>('User', userSchema);
