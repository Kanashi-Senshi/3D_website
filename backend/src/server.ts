// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';

import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';
import fileRoutes from './routes/files';
import socialRoutes from './routes/social';
import teamRoutes from './routes/teams';
import mongoose from 'mongoose';
import userRoutes from './routes/users';
import dicomRoutes from './routes/dicom.routes';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/dicom', dicomRoutes);

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: http://localhost:${port}`);
