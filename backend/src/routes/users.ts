// backend/src/routes/users.ts
import express from 'express';
import { auth } from '@/middleware/auth';
import { getDashboardStats } from '@/controllers/user.controller';

const router = express.Router();

router.get('/dashboard/stats', auth, getDashboardStats);

export default router;
