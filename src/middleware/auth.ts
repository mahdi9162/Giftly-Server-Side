import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. No token found',
      });
    }

    const decoded = jwt.verify(token, config.jwt_secret as string) as {
      userId: string;
      email: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch {

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
