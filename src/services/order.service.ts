import mongoose from 'mongoose';
import { CreateOrderPayload } from '../types/order.types';
import { Product } from '../model/product/product.model';
import { Order } from '../model/order/order.model';

// create
export const createOrderIntoDB = async (payload: CreateOrderPayload) => {
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
    });
  }

  const shippingCost = deliveryMethod === 'express' ? 8 : 0;
  const total = subtotal + shippingCost;

  const order = await Order.create({
    customerInfo,
    shippingAddress,
    deliveryMethod,
    paymentMethod,
    items: validatedItems,
    subtotal,
    shippingCost,
    total,
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });
  return order;
};

// get
export const getAllOrdersFromDB = async () => {
  const orders = await Order.find().sort({ createdAt: -1 });

  return orders;
};
