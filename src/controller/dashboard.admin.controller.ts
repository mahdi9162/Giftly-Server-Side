import { Request, Response } from 'express';
import { Order } from '../model/order/order.model';
import { Product } from '../model/product/product.model';
import { User } from '../model/user/user.model';

type RangeType = 'weekly' | 'monthly';

// get admin overview stats data
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

// sales overview - weekly and monthly -
const getSalesOverview = async (req: Request, res: Response) => {
  try {
    const range = req.query.range as RangeType;

    if (range !== 'weekly' && range !== 'monthly') {
      return res.status(400).json({
        success: false,
        message: 'Invalid range provided',
      });
    }

    const currentEnd = new Date();
    currentEnd.setHours(23, 59, 59, 999);

    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (range === 'weekly') {
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() - 6);
      currentStart.setHours(0, 0, 0, 0);

      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);

      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
    } else {
      currentStart = new Date(currentEnd.getFullYear(), currentEnd.getMonth(), 1);
      currentStart.setHours(0, 0, 0, 0);

      previousStart = new Date(currentEnd.getFullYear(), currentEnd.getMonth() - 1, 1);
      previousStart.setHours(0, 0, 0, 0);

      const previousMonthLastDay = new Date(currentEnd.getFullYear(), currentEnd.getMonth(), 0).getDate();

      const safePreviousDay = Math.min(currentEnd.getDate(), previousMonthLastDay);

      previousEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() - 1, safePreviousDay);
      previousEnd.setHours(23, 59, 59, 999);
    }

    const baseMatch = {
      paymentStatus: 'paid',
      orderStatus: { $ne: 'cancelled' },
    };

    const salesData = await Order.aggregate([
      {
        $match: {
          ...baseMatch,
          createdAt: {
            $gte: currentStart,
            $lte: currentEnd,
          },
        },
      },
      {
        $group: {
          _id:
            range === 'weekly'
              ? { $dayOfWeek: '$createdAt' }
              : {
                  $ceil: {
                    $divide: [{ $dayOfMonth: '$createdAt' }, 7],
                  },
                },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const weeklyLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthlyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

    const chartData =
      range === 'weekly'
        ? weeklyLabels.map((label, index) => {
            const mongoDayNumber = index + 1;
            const found = salesData.find((item) => item._id === mongoDayNumber);

            return {
              label,
              revenue: found?.revenue || 0,
              orderCount: found?.orderCount || 0,
            };
          })
        : monthlyLabels.map((label, index) => {
            const weekNumber = index + 1;
            const found = salesData.find((item) => item._id === weekNumber);

            return {
              label,
              revenue: found?.revenue || 0,
              orderCount: found?.orderCount || 0,
            };
          });

    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = chartData.reduce((sum, item) => sum + item.orderCount, 0);

    const bestItem = chartData.reduce((best, current) => (current.revenue > best.revenue ? current : best), chartData[0]);

    const previousOrdersCount = await Order.countDocuments({
      ...baseMatch,
      createdAt: {
        $gte: previousStart,
        $lte: previousEnd,
      },
    });

    const orderTrend =
      previousOrdersCount === 0 ? (totalOrders > 0 ? 100 : 0) : ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100;

    return res.status(200).json({
      success: true,
      message: 'Sales overview data fetched successfully',
      data: {
        range,
        totalRevenue,
        totalOrders,
        bestLabel: bestItem?.label || 'N/A',
        orderTrend: Number(orderTrend.toFixed(2)),
        chartData,
      },
    });
  } catch (error) {
    console.error('Failed to fetch sales overview:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales overview data',
    });
  }
};

// top products
const getTopProducts = async (req: Request, res: Response) => {
  try {
    const topProducts = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          orderStatus: { $ne: 'cancelled' },
        },
      },
      {
        $unwind: '$items',
      },

      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.priceAtPurchase'] },
          },
        },
      },

      {
        $sort: { totalSold: -1 },
      },

      {
        $limit: 3,
      },

      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },

      {
        $unwind: '$product',
      },

      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: topProducts,
      message: 'Top products fatched successfully!',
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to fatched top products',
    });
  }
};

export const AdminDashboardController = {
  getAdminOverview,
  getSalesOverview,
  getTopProducts,
};
