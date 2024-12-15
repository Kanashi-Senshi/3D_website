// routes/social.ts
// backend/src/routes/social.ts
import express from 'express';
import { auth, doctorOnly } from '@middleware/auth';
import { upload } from '@middleware/upload';
import {
  createCommunity,
  getCommunities,
  joinCommunity,
  createPost,
  getPosts,
  addComment,
  toggleLike,
  toggleCommentLike
} from '@controllers/social.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Community routes
router.post('/communities', doctorOnly, createCommunity);
router.get('/communities', getCommunities);
router.post('/communities/:id/join', joinCommunity);

// Post routes (with file upload support)
router.post(
  '/posts',
  doctorOnly,
  upload.array('images', 5), // Allow up to 5 images per post
  createPost
);
router.get('/posts', getPosts);

// Social interaction routes
router.post('/posts/:id/comments', addComment);
router.post('/posts/:id/like', toggleLike);
router.post('/posts/comments/:commentId/like', toggleCommentLike);

// Error handling middleware for multer
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error) {
    if (err.name === 'MulterError') {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    }
  }
  return next(err);
});

export default router;
