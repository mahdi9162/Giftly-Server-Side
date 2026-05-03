import { Request, Response } from 'express';
import { Order } from '../model/order/order.model';
import { Product } from '../model/product/product.model';
import { User } from '../model/user/user.model';

const getAdminOverview = async (req: Request, res: Response) => {
  try {
    const [revenueData, totalOrders, totalProducts, totalCustomers] = await Promise.all([
      Order.aggregate([
        {
          $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
          },
        },
      ]),

      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const dashboardStats = {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
    };

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard data fetched successfully',
      data: dashboardStats,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data',
    });
  }
};

export const AdminDashboardController = {
  getAdminOverview,
};
