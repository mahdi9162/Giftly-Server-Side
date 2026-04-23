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
  deliveryMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'card';
  items: {
    productId: string;
    quantity: number;
  }[];
};
