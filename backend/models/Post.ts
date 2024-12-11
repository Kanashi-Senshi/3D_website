// backend/models/Post.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: mongoose.Types.ObjectId[];
}

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  images: string[];
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  tags: string[];
  isAnnouncement: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  addComment(userId: string, content: string): Promise<void>;
  removeComment(commentId: string): Promise<void>;
  toggleLike(userId: string): Promise<void>;
  toggleCommentLike(commentId: string, userId: string): Promise<void>;
}

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  images: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true
  }],
  isAnnouncement: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// Method to add a comment
postSchema.methods.addComment = async function(userId: string, content: string) {
  const comment = {
    user: new mongoose.Types.ObjectId(userId),
    content,
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  this.comments.push(comment);
  await this.save();
};

// Method to remove a comment
postSchema.methods.removeComment = async function(commentId: string) {
  const commentIndex = this.comments.findIndex(
    (comment: IComment) => comment._id.toString() === commentId
  );
  if (commentIndex !== -1) {
    this.comments.splice(commentIndex, 1);
    await this.save();
  }
};

// Method to toggle like on post
postSchema.methods.toggleLike = async function(userId: string) {
  const userIdObj = new mongoose.Types.ObjectId(userId);
  const likeIndex = this.likes.findIndex(
    (id: mongoose.Types.ObjectId) => id.toString() === userId
  );

  if (likeIndex === -1) {
    this.likes.push(userIdObj);
  } else {
    this.likes.splice(likeIndex, 1);
  }
  await this.save();
};

// Method to toggle like on comment
postSchema.methods.toggleCommentLike = async function(commentId: string, userId: string) {
  const comment = this.comments.find(
    (comment: IComment) => comment._id.toString() === commentId
  );
  if (!comment) return;

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const likeIndex = comment.likes.findIndex(
    (id: mongoose.Types.ObjectId) => id.toString() === userId
  );

  if (likeIndex === -1) {
    comment.likes.push(userIdObj);
  } else {
    comment.likes.splice(likeIndex, 1);
  }
  await this.save();
};

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

export const Post = mongoose.model<IPost>('Post', postSchema);
