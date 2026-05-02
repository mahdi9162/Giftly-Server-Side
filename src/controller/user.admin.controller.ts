import { Request, Response } from 'express';
import { User } from '../model/user/user.model';
import { Types } from 'mongoose';
import { UserStatus } from '../types/user.interface';

type AuthRequest = Request<{ id: string }> & {
  user?: {
    _id: string;
    role: string;
  };
};

// get user
const adminGetUsers = async (req: Request, res: Response) => {
  try {
    const { search, status, joined, page = '1', limit = '9' } = req.query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }

    // status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // day
    const start = new Date();

    if (joined === 'last-7-days') {
      start.setDate(start.getDate() - 7);
      filter.createdAt = { $gte: start };
    } else if (joined === 'this-month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: start };
    }

    let sortOrder: 1 | -1 = -1;
    if (joined === 'oldest') {
      sortOrder = 1;
    }

    // pagenation
    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 9;
    const skip = (currentPage - 1) * perPage;

    const users = await User.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(perPage);

    // according to filter
    const filteredCount = await User.countDocuments(filter);

    // overall total
    const allUsersCount = await User.countDocuments();

    // for create total page
    const totalPages = Math.ceil(filteredCount / perPage);

    // According to status
    const activeStatus = await User.countDocuments({ status: 'active' });
    const inactiveStatus = await User.countDocuments({ status: 'inactive' });
    const blockedStatus = await User.countDocuments({ status: 'blocked' });

    return res.status(200).json({
      success: true,
      message: 'Admin users fetched successfully',
      meta: {
        allUsersCount,
        totalPages,
        activeStatus,
        inactiveStatus,
        blockedStatus,
      },
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error,
    });
  }
};

// activate => deactivate => block API
const adminUpdateUsers = async (req: Request<{ id: string }, unknown, UserStatus>, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const allowedStatuses = ['active', 'inactive', 'blocked'] as const;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user status',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        status,
        statusUpdatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Failed to update user status:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

// delete user
const adminDeleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // current logged-in admin
    const currentUserId = req.user?._id;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    // prevent self delete
    if (currentUserId && currentUserId.toString() === id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser,
    });
  } catch (error) {
    console.error('Failed to delete user:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

export const AdminUserController = {
  adminGetUsers,
  adminUpdateUsers,
  adminDeleteUser,
};
