// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      req.user = user;
      req.userId = user._id.toString();
      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      throw err;
    }
  } catch (error) {
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Please authenticate'
    });
  }
};

export const doctorOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};
