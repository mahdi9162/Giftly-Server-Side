import { Request, Response } from 'express';
import { User } from '../model/user/user.model';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';
import bcrypt from 'bcryptjs';

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
    });

    // Generate token
    const token = jwt.sign({ userId: savedUser._id, email: savedUser.email, role: savedUser.role }, config.jwt_secret as Secret, {
      expiresIn: config.jwt_expires_in as any,
    });

    // Omit password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    // set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.message,
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
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, config.jwt_secret as Secret, {
      expiresIn: config.jwt_expires_in as any,
    });

    // Omit password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: userResponse,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to login user',
      error: err.message,
    });
  }
};

export const userControllers = {
  register,
  login,
};
