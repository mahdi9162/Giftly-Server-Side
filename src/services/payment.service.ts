import mongoose from 'mongoose';
import { CreateCheckoutSessionPayload } from '../types/CheckoutSessionPayload';
import { Product } from '../model/product/product.model';
import { stripe } from '../config/stripe';

export const CreateCheckoutSession = async (payload: CreateCheckoutSessionPayload) => {
  const { customerInfo, deliveryMethod, shippingAddress, items } = payload;

  if (!items || items.length === 0) {
    throw new Error('Order items are required');
  }

  const line_items: {
    price_data: {
      currency: string;
      product_data: {
        name: string;
      };
      unit_amount: number;
    };
    quantity: number;
  }[] = [];

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

    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    });
  }

  if (deliveryMethod === 'express') {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Express Delivery',
        },
        unit_amount: 800,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerInfo.email,
    line_items,

    metadata: {
      customerName: customerInfo.fullName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      deliveryMethod,
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify(items),
    },

    success_url: `${process.env.CLIENT_URL}/checkout/success`,
    cancel_url: `${process.env.CLIENT_URL}/checkout`,
  });

  return session;
};
