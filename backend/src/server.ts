// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { testSupabaseConnection } from './config/supabase';

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

try {
  testSupabaseConnection().then(connected => {
    if (!connected) {
      console.error('Failed to connect to Supabase. Check your configuration.');
      process.exit(1);
    }
  });
} catch (error) {
  console.error('Error testing Supabase connection:', error);
  process.exit(1);
}

connectDB().catch((err: any) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Add request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  /* console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`); */
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Log middleware limits
/* console.log('Server configuration:', {
  jsonLimit: app.get('json limit'),
  urlEncodedLimit: app.get('urlencoded limit'),
  timeout: app.get('timeout'),
  maxUploadSize: process.env.MAX_UPLOAD_SIZE || 'not set'
}); */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/dicom', dicomRoutes);

// Debug output for registered routes
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    /* console.log(`Route registered: ${r.route.path}`); */
  } else if (r.name === 'router') {
    r.handle.stack.forEach((r2: any) => {
      if (r2.route) {
        /* console.log(`Subroute registered: ${r2.route.path}`); */
      }
    });
  }
});

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'ok',
    //TODO: Output timestamp as current date ISOsTRING
    // timestamp: new Date().toISOString(),
    timestamp: '2024-03-20T15:00:00.000Z',
    mongodb: ((mongoose as any).connection?.readyState === 1) ? 'connected' : 'disconnected'
  });
});



app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  /* console.log(`Server is running on port ${port}`); */
  /* console.log(`Environment: ${process.env.NODE_ENV}`); */
  /* console.log(`API URL: http://localhost:${port}`); */
});

app.use('/api/dicom/upload', express.raw({
  limit: '500mb',
  type: 'multipart/form-data'
}))

