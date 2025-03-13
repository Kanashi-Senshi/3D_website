// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import mongoose, { mongo } from 'mongoose';
import { User } from "@models/User";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { createSupabaseClient } from '@/config/supabase';
import { generateToken } from '@/middleware/auth';
import {v5 as uuidv5} from 'uuid';

// Initialize dotenv
config();

//Consistent namespace UUID for converrting MongoDB IDs to UUIDs
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

//convert MongoDB ID to UUID
const mongoIdToUuid = (id: string): string => {
  return uuidv5(id, NAMESPACE);
};

const genereteSupabaseUUID = (mongoId: string): string => {
  const supabaseUUID = mongoIdToUuid(mongoId);
  return supabaseUUID;
}

export const signup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create MongoDB user
    const user = new User({
      email,
      password, // Will be hashed by pre-save hook
      name,
      role,
    });

    await user.save();

    // Create corresponding Supabase user
    const supabase = createSupabaseClient();
    try {
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            mongoId: user._id.toString(),
            role: role,
            name: name
          }
        }
      });
      

      if (supabaseError) {
        console.log("Supabase Error:", supabaseError)
        // Delete MongoDB user if Supabase creation fails
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ 
          error: 'Error creating Supabase user',
          details: supabaseError.message
        });
      }

      // Generate token after both accounts are created
      const token = generateToken(user._id.toString(), user.email, user.role );

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };


      return res.status(201).json({
        user: userResponse,
        token,
        message: 'Registration successful'
      });
    } catch (supabaseError) {
      // Clean up MongoDB user if Supabase throws an error
      await User.findByIdAndDelete(user._id);
      // console.error('Supabase signup error:', supabaseError);
      return res.status(500).json({ error: 'Error creating user accounts' });
    }

  } catch (error) {
    // console.error('Signup error:', error);
    return res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate Express JWT
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Create Supabase account if it doesn't exist
    // const supabase = createSupabaseClient();
    // try {
    //   const { data: supabaseUser, error: signUpError } = await supabase.auth.signUp({
    //     email,
    //     password,
    //     options: {
    //       data: {
    //         mongoId: user._id.toString(),
    //         role: user.role,
    //         sub: genereteSupabaseUUID(user._id.toString()),
    //         name: user.name
    //       }
    //     }
    //   });

    //   if (signUpError && signUpError.message !== 'User already registered') {
    //     // console.error('Supabase signup error:', signUpError);
    //     // Continue anyway - user can still use the app
    //   }

    // } catch (supabaseError) {
    //   // console.error('Supabase auth error:', supabaseError);
    //   // Continue - don't block login if Supabase fails
    // }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Error updating profile' });
  }
};