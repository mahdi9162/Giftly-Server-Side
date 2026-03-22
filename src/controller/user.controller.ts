import { Request, Response } from 'express';
import { User } from '../model/user/user.model';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';

// register
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

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      token,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.message,
    });
  }
};

export const userControllers = {
  register,
};
