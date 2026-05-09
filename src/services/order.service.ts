import mongoose from 'mongoose';
import { CreateOrderPayload, OrderStatus, PaymentStatus } from '../types/order.types';
import { Product } from '../model/product/product.model';
import { Order } from '../model/order/order.model';

type MyOrdersQuery = {
  page?: string;
  limit?: string;
  search?: string;
  orderStatus?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  date?: string;
};

// create
export const createOrderRecord = async (payload: CreateOrderPayload, paymentStatus: 'pending' | 'paid', stripeSessionId?: string) => {
  const { customerInfo, shippingAddress, deliveryMethod, paymentMethod, items } = payload;

  if (!items || items.length === 0) {
    throw new Error('Order items are required');
  }

  let subtotal = 0;

  const validatedItems = [];

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new Error(`Invalid product id: ${item.productId}`);
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Not enough stock for product: ${product.name}`);
    }

    product.stock = product.stock - item.quantity;
    await product.save();

    subtotal += product.price * item.quantity;

    validatedItems.push({
      productId: product._id,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    });
  }

  const shippingCost = deliveryMethod === 'express' ? 8 : 0;
  const total = subtotal + shippingCost;

  const paidAt = paymentStatus === 'paid' ? new Date() : undefined;

  const order = await Order.create({
    stripeSessionId,
    customerInfo,
    shippingAddress,
    deliveryMethod,
    paymentMethod,
    items: validatedItems,
    subtotal,
    shippingCost,
    total,
    paymentStatus,
    paidAt,
    orderStatus: 'pending',
  });
  return order;
};

// COD order
export const createCodOrderIntoDB = async (payload: CreateOrderPayload) => {
  return createOrderRecord(payload, 'pending');
};

// PAID order
export const createPaidOrderIntoDB = async (payload: CreateOrderPayload, stripeSessionId?: string) => {
  const existingOrder = await Order.findOne({ stripeSessionId });

  if (existingOrder) {
    return existingOrder;
  }

  return createOrderRecord(payload, 'paid', stripeSessionId);
};

// get my orders overview
export const getMyOrdersOverview = async (userId: string) => {
  try {
    const orders = await Order.find({ 'customerInfo._id': userId })
      .select('_id total orderStatus paymentStatus createdAt items')
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return [];
    } else {
      return orders;
    }
  } catch (error) {
    console.log(error);
  }
};

// my weekly trend
export const getMyWeeklyTrend = async (userId: string) => {
  const currentEnd = new Date();
  currentEnd.setHours(23, 59, 59, 999);
  const currentStart = new Date();
  currentStart.setDate(currentStart.getDate() - 6);
  currentStart.setHours(0, 0, 0, 0);

  const ordersTrend = await Order.aggregate([
    {
      $match: { 'customerInfo._id': userId, createdAt: { $gte: currentStart, $lte: currentEnd }, orderStatus: { $ne: 'cancelled' } },
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        day: '$_id',
        totalOrders: 1,
      },
    },
  ]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const defaultWeeklyData = [
    { day: 1, totalOrders: 0 },
    { day: 2, totalOrders: 0 },
    { day: 3, totalOrders: 0 },
    { day: 4, totalOrders: 0 },
    { day: 5, totalOrders: 0 },
    { day: 6, totalOrders: 0 },
    { day: 7, totalOrders: 0 },
  ];

  const allData = defaultWeeklyData.map((dayItem) => {
    const foundOrder = ordersTrend.find((order) => order.day === dayItem.day);

    if (foundOrder) {
      return foundOrder;
    } else {
      return dayItem;
    }
  });

  const result = allData.map((item) => {
    return { name: dayLabels[item.day - 1], orders: item.totalOrders };
  });

  return result;
};

// get my full orders list
export const getMyFullOrdersList = async (userId: string, query: MyOrdersQuery) => {
  if (!userId) {
    return { message: 'User Id not found' };
  }

  const filter: Record<string, unknown> = {
    'customerInfo._id': userId,
  };

  const { page = '1', limit = '9', search, orderStatus, paymentStatus, date } = query;

  // date

  if (date === 'last-7-days') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    start.setDate(start.getDate() - 6);

    filter.createdAt = { $gte: start };
  }

  if (date === 'this-month') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(1);

    filter.createdAt = { $gte: start };
  }

  let sortOrder: 1 | -1 = -1;
  if (date === 'oldest') {
    sortOrder = 1;
  }

  // payment status
  if (paymentStatus && paymentStatus !== 'all') {
    filter.paymentStatus = paymentStatus;
  }

  // order status
  if (orderStatus && orderStatus !== 'all') {
    filter.orderStatus = orderStatus;
  }

  // search
  if (search) {
    const trimmedSearch = search.trim();

    if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
      filter._id = trimmedSearch;
    } else {
      filter._id = null;
    }
  }

  // pagination
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 9;
  const skip = (currentPage - 1) * perPage;

  const totalOrders = await Order.countDocuments(filter);
  const totalPages = Math.ceil(totalOrders / perPage);

  const orders = await Order.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(perPage);

  return {
    meta: {
      totalOrders,
      totalPages,
      currentPage,
      perPage,
    },
    data: orders,
  };
};
