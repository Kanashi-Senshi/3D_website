// backend/models/Team.ts
import mongoose, { Document, Schema } from 'mongoose';

interface ISharedFile {
  file: mongoose.Types.ObjectId;
  sharedBy: mongoose.Types.ObjectId;
  sharedAt: Date;
  notes: string;
}

export interface ITeam extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  sharedFiles: ISharedFile[];
  joinCode: string;
  createdAt: Date;
  updatedAt: Date;
  isMember(userId: string): boolean;
  isOwner(userId: string): boolean;
  addMember(userId: string): Promise<void>;
  removeMember(userId: string): Promise<void>;
  shareFile(fileId: string, userId: string, notes?: string): Promise<void>;
}

const sharedFileSchema = new Schema({
  file: {
    type: Schema.Types.ObjectId,
    ref: 'MedicalFile',
    required: true
  },
  sharedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

const teamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharedFiles: [sharedFileSchema],
  joinCode: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

teamSchema.index({ owner: 1 });
teamSchema.index({ members: 1 });
teamSchema.index({ joinCode: 1 });

teamSchema.methods.isMember = function(userId: string): boolean {
  return this.members.some((id: mongoose.Types.ObjectId) => id.toString() === userId) ||
         this.owner.toString() === userId;
};

teamSchema.methods.isOwner = function(userId: string): boolean {
  return this.owner.toString() === userId;
};

teamSchema.methods.addMember = async function(userId: string) {
  if (!this.isMember(userId)) {
    this.members.push(new mongoose.Types.ObjectId(userId));
    await this.save();
  }
};

teamSchema.methods.removeMember = async function(userId: string) {
  if (!this.isOwner(userId)) {
    this.members = this.members.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== userId
    );
    await this.save();
  }
};

teamSchema.methods.shareFile = async function(
  fileId: string,
  userId: string,
  notes: string = ''
) {
  if (this.isMember(userId)) {
    this.sharedFiles.push({
      file: new mongoose.Types.ObjectId(fileId),
      sharedBy: new mongoose.Types.ObjectId(userId),
      sharedAt: new Date(),
      notes
    });
    await this.save();
  }
};

teamSchema.pre('save', function(next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

export const Team = mongoose.model<ITeam>('Team', teamSchema);
