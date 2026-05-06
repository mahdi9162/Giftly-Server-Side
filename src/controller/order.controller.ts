import { Request, Response } from 'express';
import { createCodOrderIntoDB, getMyOrdersFromDB } from '../services/order.service';
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
const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User Id not found!',
      });
    }

    const orders = await getMyOrdersFromDB(userId);

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

export const UserOrder = {
  createOrder,
  getMyOrders,
};
