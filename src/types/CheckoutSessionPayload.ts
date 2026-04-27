export type DeliveryMethod = 'standard' | 'express';
export type PaymentMethod = 'cod' | 'card';

export type CreateCheckoutSessionPayload = {
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
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    quantity: number;
  }[];
};
