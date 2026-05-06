import { Request, Response } from 'express';
import { createCodOrderIntoDB, getAllOrdersFromDB } from '../services/order.service';

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

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const result = await getAllOrdersFromDB();

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: result,
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
  getAllOrders,
};
