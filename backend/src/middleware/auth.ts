// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { createSupabaseClient } from '../config/supabase';
import {v5 as uuidv5} from 'uuid';

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId: string;
    }
  }
}

//Consistent namespace UUID for converrting MongoDB IDs to UUIDs
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

//convert MongoDB ID to UUID
const mongoIdToUuid = (id: string): string => {
  return uuidv5(id, NAMESPACE);
};

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // First verify Express JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Check MongoDB user
    const mongoUser = await User.findById(decoded.userId);
    if (!mongoUser) {
      throw new Error('User not found in MongoDB');
    }

    // Generate consistent Supabase UUID
    const supabaseUUID = mongoIdToUuid(mongoUser._id.toString());

    // Create Supabase JWT with required claims
    const supabaseToken = jwt.sign({
      sub: supabaseUUID,
      email: mongoUser.email,
      role: 'authenticated',
      aud: process.env.SUPABASE_URL,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      iat: Math.floor(Date.now() / 1000),
      user_metadata: {
        mongoId: mongoUser._id.toString(),
        role: mongoUser.role,
        name: mongoUser.name
      },
      app_metadata: {
        provider: 'email'
      }
    }, process.env.SUPABASE_JWT_SECRET!, {
      algorithm: 'HS256'
    });

    // Initialize Supabase with proper token
    const supabase = createSupabaseClient();
    await supabase.auth.setSession({
      access_token: supabaseToken,
      refresh_token: ''
    });

    // Verify Supabase user exists or create one
    const { data: { user: supabaseUser }, error: getUserError } = await supabase.auth.getUser();
    

    if (getUserError || !supabaseUser) {
      // Check if the error is specifically NOT a "user already exists" error
      if (!getUserError || getUserError.message !== 'User already registered') {
        try {
          const { error: signUpError } = await supabase.auth.signUp({
            email: mongoUser.email,
            password: process.env.SUPABASE_DEFAULT_PASSWORD || `temp-${Date.now()}`,
            options: {
              data: {
                mongoId: mongoUser._id.toString(),
                role: mongoUser.role,
                name: mongoUser.name
              }
            }
          });

          if (signUpError && signUpError.message !== 'User already registered') {
            console.error('Error creating Supabase user:', signUpError);
          }
        } catch (err) {
          console.error('Error in Supabase account recovery:', err);
          // Continue with token-based session
        }
      }
    }

    // Set request properties
    req.user = mongoUser;
    req.userId = mongoUser._id.toString();
    (req as any).supabaseClient = supabase;

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
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

export const generateToken = (userId: string, email: string, role: string): string => {
  const supabaseUUID = mongoIdToUuid(userId);

  return jwt.sign(
    { 
      userId,
      email,
      role,
      sub: supabaseUUID,
      supabaseUUID,
      aud: process.env.SUPABASE_URL
    },
    process.env.JWT_SECRET as string,
    { 
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
};
