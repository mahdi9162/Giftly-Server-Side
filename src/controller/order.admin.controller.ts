import { Request, Response } from 'express';
import { Order } from '../model/order/order.model';
import { Types } from 'mongoose';
import { OrderStatus, PaymentStatus } from '../types/order.types';

// get api
const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '9', orderStatus, paymentStatus, date, amount } = req.query;

    const search = req.query.search as string;

    const filter: Record<string, unknown> = {};

    // date
    if (date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    if (date === 'last-7-days') {
      const start = new Date();
      start.setDate(start.getDate() - 7);

      filter.createdAt = { $gte: start };
    }

    if (date === 'this-month') {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      filter.createdAt = { $gte: start };
    }

    let sortOrder: 1 | -1 = -1;
    if (date === 'oldest') {
      sortOrder = 1;
    }

    // amount

    if (amount === 'under-50') {
      filter.total = { $lt: 50 };
    }

    if (amount === '50-100') {
      filter.total = { $gte: 50, $lte: 100 };
    }

    if (amount === '100-200') {
      filter.total = { $gte: 100, $lte: 200 };
    }

    if (amount === 'above-200') {
      filter.total = { $gt: 200 };
    }

    // search
    if (search) {
      const orConditions: unknown[] = [
        { 'customerInfo.fullName': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
      ];

      filter.$or = orConditions;
    }

    // order status
    if (orderStatus && orderStatus !== 'all') {
      filter.orderStatus = orderStatus;
    }

    // payment status
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    // pagenation
    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 9;
    const skip = (currentPage - 1) * perPage;

    const orders = await Order.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(perPage);

    // According to filter
    const filteredCount = await Order.countDocuments(filter);

    // overall total
    const allOrdersCount = await Order.countDocuments();

    // for create total page
    const totalPages = Math.ceil(filteredCount / perPage);

    // According to order status
    const pendingOrder = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrder = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrder = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrder = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrder = await Order.countDocuments({ orderStatus: 'cancelled' });

    // According to payments
    const paidOrder = await Order.countDocuments({ paymentStatus: 'paid' });
    const unPaidOrder = await Order.countDocuments({ paymentStatus: 'pending' });
    const refundedOrder = await Order.countDocuments({ paymentStatus: 'refunded' });

    return res.status(200).json({
      success: true,
      message: 'Admin orders fetched successfully',
      meta: {
        allOrdersCount,
        filteredCount,
        totalPages,
        currentPage,
        perPage,
        pendingOrder,
        processingOrder,
        shippedOrder,
        deliveredOrder,
        cancelledOrder,
        paidOrder,
        unPaidOrder,
        refundedOrder,
      },
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin products',
      error,
    });
  }
};

// update api
const updateOrderAndPaymentStatus = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    // invalid mongo id
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    //check product exists
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (existingOrder.orderStatus === 'delivered') {
      return res.status(400).json({
        message: 'Delivered order cannot be updated',
      });
    }

    if (existingOrder.orderStatus === 'cancelled') {
      return res.status(400).json({
        message: 'Cancelled order cannot be updated',
      });
    }

    const allowedFields = ['orderStatus', 'paymentStatus'];

    const validOrderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status!' });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status!' });
    }

    // orders flow
    const orderStatusFlow: Record<OrderStatus, OrderStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    const currentStatus: OrderStatus = existingOrder.orderStatus;

    if (orderStatus && !orderStatusFlow[currentStatus].includes(orderStatus)) {
      return res.status(400).json({
        message: 'Cannot update status without status flow',
      });
    }

    const updateData: Record<string, string | Date> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    if (orderStatus === 'delivered') {
      updateData.paymentStatus = 'paid';
      updateData.paidAt = new Date();
    }

    const now = new Date();

    if (orderStatus === 'processing') {
      updateData.confirmedAt = now;
    }

    if (orderStatus === 'shipped') {
      updateData.shippedAt = now;
    }

    if (orderStatus === 'delivered') {
      updateData.deliveredAt = now;
    }

    if (orderStatus === 'cancelled') {
      updateData.cancelledAt = now;
    }

    // DB update
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error,
    });
  }
};

export const AdminOrderController = {
  getAdminOrders,
  updateOrderAndPaymentStatus,
};
