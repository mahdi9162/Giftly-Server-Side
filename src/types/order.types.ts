export type CreateOrderPayload = {
  customerInfo: {
    _id: string;
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
  items: {
    productId: string;
    quantity: number;
  }[];
};

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type UpdateOrderStatusPayload = {
  orderStatus: OrderStatus;
};
