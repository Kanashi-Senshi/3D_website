// backend/models/Community.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description: string;
  productType: string;
  createdBy: mongoose.Types.ObjectId;
  moderators: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  joinCode?: string;
  createdAt: Date;
  updatedAt: Date;
  isModerator(userId: string): boolean;
  isMember(userId: string): boolean;
  addMember(userId: string): Promise<void>;
  removeMember(userId: string): Promise<void>;
  addModerator(userId: string): Promise<void>;
  removeModerator(userId: string): Promise<void>;
}

const communitySchema = new Schema<ICommunity>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  productType: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  joinCode: {
    type: String,
    trim: true,
    sparse: true
  }
}, {
  timestamps: true
});

communitySchema.index({ name: 1 });
communitySchema.index({ productType: 1 });
communitySchema.index({ createdBy: 1 });

communitySchema.methods.isModerator = function(this: ICommunity, userId: string): boolean {
  return this.moderators.some((id: mongoose.Types.ObjectId) => id.toString() === userId) ||
         this.createdBy.toString() === userId;
};

communitySchema.methods.isMember = function(this: ICommunity, userId: string): boolean {
  return this.members.some((id: mongoose.Types.ObjectId) => id.toString() === userId);
};

communitySchema.methods.addMember = async function(this: ICommunity, userId: string) {
  if (!this.isMember(userId)) {
    this.members.push(new mongoose.Types.ObjectId(userId));
    await this.save();
  }
};

communitySchema.methods.removeMember = async function(this: ICommunity, userId: string) {
  this.members = this.members.filter(
    (id: mongoose.Types.ObjectId) => id.toString() !== userId
  );
  await this.save();
};

communitySchema.methods.addModerator = async function(this: ICommunity, userId: string) {
  if (!this.isModerator(userId)) {
    this.moderators.push(new mongoose.Types.ObjectId(userId));
    await this.save();
  }
};

communitySchema.methods.removeModerator = async function(this: ICommunity, userId: string) {
  if (this.createdBy.toString() !== userId) {
    this.moderators = this.moderators.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== userId
    );
    await this.save();
  }
};

export const Community = mongoose.model<ICommunity>('Community', communitySchema);
