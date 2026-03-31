import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';

export const allowRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No user found',
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role authorization failed',
      });
    }
  };
};
