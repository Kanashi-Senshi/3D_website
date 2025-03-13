// backend/src/middleware/supabase.ts
import { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../config/supabase';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { appendFile } from 'fs';

export const requireSupabase = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // First verify the Express token and get user info
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get MongoDB user details
    const mongoUser = await User.findById(decoded.userId);
    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Supabase client with explicit session
    const supabase = createSupabaseClient();
    const supabaseToken = jwt.sign(
      {
        sub: decoded.userId,
        email: mongoUser.email,
        role: 'authenticated',
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
        iat: Math.floor(Date.now() / 1000),
        user_metadata: {
          id: decoded.userId
      },
      app_metadata: {
        provider: 'email'
      }
    },
      process.env.SUPABASE_JWT_SECRET!, {
        algorithm: 'HS256'
      }
    );

    // Set session explicitly
    await supabase.auth.setSession({
      access_token: supabaseToken,
      refresh_token: ''
    });

    // Verify the session worked by getting user
    const { data: { user: supabaseUser }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !supabaseUser) {
      // Try to create/link Supabase account if it doesn't exist
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: mongoUser.email,
          password: process.env.SUPABASE_DEFAULT_PASSWORD || 'temp-password-' + Date.now(),
          options: {
            data: {
              mongoId: mongoUser._id.toString(),
              role: mongoUser.role,
              name: mongoUser.name
            }
          }
        });

        if (signUpError) {
          console.error('Error creating Supabase user:', signUpError);
          // Continue anyway - we'll try to proceed with the token-based session
        }
      } catch (err) {
        console.error('Error in Supabase account recovery:', err);
        // Continue with token-based session
      }
    }

    // Attach verified client to request
    (req as any).supabase = supabase;
    (req as any).supabaseUser = supabaseUser || {
      id: decoded.userId,
      email: mongoUser.email,
      user_metadata: {
        mongoId: decoded.userId,
        role: mongoUser.role,
        name: mongoUser.name
      }
    };

    return next();
  } catch (error) {
    console.error('Supabase middleware error:', error);
    return res.status(500).json({ 
      error: 'Supabase authentication error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};