// backend/src/config/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options = {
      autoIndex: true, // Build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    await (mongoose as any).connect(process.env.MONGODB_URI, options);

    (mongoose as any).connection.on('connected', () => {
      /* console.log('MongoDB Connected Successfully'); */
    });

    (mongoose as any).connection.on('error', (err: any) => {
      console.error('MongoDB connection error:', err);
    });

    (mongoose as any).connection.on('disconnected', () => {
      /* console.log('MongoDB disconnected'); */
    });

    process.on('SIGINT', async (): Promise<void> => {
      await (mongoose as any).connection.close();
      /* console.log('MongoDB connection closed through app termination'); */
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Rethrow to be caught by the server
  }
};

export default connectDB;
