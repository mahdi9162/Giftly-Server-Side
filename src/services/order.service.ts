import mongoose from 'mongoose';
import { CreateOrderPayload } from '../types/order.types';
import { Product } from '../model/product/product.model';
import { Order } from '../model/order/order.model';

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

// get order
export const getAllOrdersFromDB = async () => {
  const orders = await Order.find().sort({ createdAt: -1 });

  return orders;
};

