import { Request, Response } from 'express';
import { User } from '../model/user/user.model';

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

export const AdminUserController = {
  adminGetUsers,
};
