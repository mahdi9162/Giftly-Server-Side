import { Request, Response } from 'express';
import { User } from '../model/user/user.model';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import config from '../config';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';

const jwtOptions: SignOptions = {
  expiresIn: config.jwt_expires_in as SignOptions['expiresIn'],
};

// register user
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const savedUser = await User.create({
      name,
      email,
      password,
      status: 'active'
    });

    // Generate token
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      config.jwt_secret as Secret,
      jwtOptions,
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    // Omit password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: userResponse,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password as string);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, config.jwt_secret as Secret, jwtOptions);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    // Omit password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      data: userResponse,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to login user',
    });
  }
};

// Logout user
const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to logout user',
    });
  }
};

// Me
const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
    });
  }
};
export const userControllers = {
  register,
  login,
  logout,
  getMe,
};
