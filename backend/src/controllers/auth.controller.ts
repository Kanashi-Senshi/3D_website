// controllers/auth.controller.ts
// backend/src/controllers/auth.controller.ts
// backend/src/controllers/auth.controller.ts
// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { User } from '@models/User';
import { generateToken } from '@middleware/auth';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, specialization, licenseNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      ...(role === 'doctor' && { specialization, licenseNumber })
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    return res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    return res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('teams', 'name');
    
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
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'profilePicture', 'specialization'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    updates.forEach(update => {
      if (req.body[update]) {
        (user as any)[update] = req.body[update];
      }
    });

    await user.save();
    return res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Error updating profile' });
  }
};
