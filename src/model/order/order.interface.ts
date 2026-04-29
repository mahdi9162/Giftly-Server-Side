import { Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IOrder {
  stripeSessionId?: string;

  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };

  shippingAddress: {
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
  };

  deliveryMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'card';

  items: IOrderItem[];

  subtotal: number;
  shippingCost: number;
  total: number;

  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  paidAt?: Date;
}
