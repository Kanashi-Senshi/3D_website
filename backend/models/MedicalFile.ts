// models/MedicalFile.ts
// backend/models/MedicalFile.ts
// backend/models/MedicalFile.ts
// backend/models/MedicalFile.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalFile extends Document {
  fileName: string;
  fileType: 'stl' | 'dicom';
  filePath: string;
  uploadedBy: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  size: number;
  status: 'processing' | 'completed' | 'failed';
  notes: string[];
  tags: string[];
  segmented: boolean;
  segmentedFilePath?: string;
  createdAt: Date;
  updatedAt: Date;
  sharedWith: mongoose.Types.ObjectId[];
  hasAccess(userId: string): boolean;
  addNote(note: string): Promise<IMedicalFile>;
  addTags(newTags: string[]): Promise<IMedicalFile>;
  shareWith(userIds: string[]): Promise<IMedicalFile>;
}

const medicalFileSchema = new Schema<IMedicalFile>({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    enum: ['stl', 'dicom'],
    required: true
  },
  filePath: {
    type: String,
    required: true,
    unique: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  notes: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  segmented: {
    type: Boolean,
    default: false
  },
  segmentedFilePath: {
    type: String,
    trim: true
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
medicalFileSchema.index({ uploadedBy: 1, createdAt: -1 });
medicalFileSchema.index({ patient: 1, createdAt: -1 });
medicalFileSchema.index({ fileType: 1 });
medicalFileSchema.index({ tags: 1 });

// Virtual for file URL (to be populated when needed)
medicalFileSchema.virtual('fileUrl').get(function(this: IMedicalFile) {
  return null; // Will be populated by the controller when needed
});

// Virtual for segmented file URL (to be populated when needed)
medicalFileSchema.virtual('segmentedFileUrl').get(function(this: IMedicalFile) {
  return this.segmentedFilePath ? null : undefined; // Will be populated by the controller when needed
});

// Method to check if a user has access to this file
medicalFileSchema.methods.hasAccess = function(this: IMedicalFile, userId: string): boolean {
  return (
    this.uploadedBy.toString() === userId ||
    this.patient.toString() === userId ||
    this.sharedWith.some((id: mongoose.Types.ObjectId) => id.toString() === userId)
  );
};

// Method to add a note
medicalFileSchema.methods.addNote = function(this: IMedicalFile, note: string) {
  this.notes.push(note);
  return this.save();
};

// Method to add tags
medicalFileSchema.methods.addTags = function(this: IMedicalFile, newTags: string[]) {
  const uniqueTags = new Set([...this.tags, ...newTags]);
  this.tags = Array.from(uniqueTags);
  return this.save();
};

// Method to share with users
medicalFileSchema.methods.shareWith = function(this: IMedicalFile, userIds: string[]) {
  const uniqueUserIds = userIds.map(id => new mongoose.Types.ObjectId(id));
  const currentSharedWithStrings = this.sharedWith.map(id => id.toString());
  const newUniqueUserIds = uniqueUserIds.filter(id => 
    !currentSharedWithStrings.includes(id.toString())
  );
  
  this.sharedWith = [...this.sharedWith, ...newUniqueUserIds];
  return this.save();
};

export const MedicalFile = mongoose.model<IMedicalFile>('MedicalFile', medicalFileSchema);
