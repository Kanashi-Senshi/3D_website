// backend/src/routes/auth.ts
import express from 'express';
import { signup, login, getProfile, updateProfile } from '@controllers/auth.controller';
import { auth } from '@middleware/auth';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);

export default router;