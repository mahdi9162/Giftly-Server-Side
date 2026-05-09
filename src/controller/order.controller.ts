import { Request, Response } from 'express';
import { createCodOrderIntoDB, getMyFullOrdersList, getMyOrdersOverview, getMyWeeklyTrend } from '../services/order.service';
import { AuthRequest } from '../middleware/auth';

// create order
const createOrder = async (req: Request, res: Response) => {
  try {
    const result = await createCodOrderIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order';

    res.status(400).json({
      success: false,
      message,
    });
  }
};

// get my orders
const getOrdersOverview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User Id not found!',
      });
    }
    const orders = await getMyOrdersOverview(userId);

    if (orders?.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No orders available right now!',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Your orders have been retrieved successfully',
      data: orders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get orders';

    res.status(400).json({
      success: false,
      message,
    });
  }
};

// my weekly trend
const getWeeklyTrend = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User Id not found!',
      });
    }

    const chartData = await getMyWeeklyTrend(userId);

    if (chartData?.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No chart data available right now!',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chart data fetched successfully',
      data: chartData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetched chart data';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// get my full orders list
const getFullOrdersList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User Id not found!',
      });
    }

    const result = await getMyFullOrdersList(userId as string, req.query);

    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetched orders data';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const UserOrder = {
  createOrder,
  getOrdersOverview,
  getWeeklyTrend,
  getFullOrdersList,
};
