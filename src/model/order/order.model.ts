import { model, Schema } from 'mongoose';
import { IOrder } from './order.interface';

const orderSchema = new Schema<IOrder>(
  {
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    customerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    shippingAddress: {
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    deliveryMethod: {
      type: String,
      enum: ['standard', 'express'],
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'card'],
      required: true,
    },

    items: [
      {
        _id: false,

        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
    },

    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    confirmedAt: {
      type: Date,
    },

    shippedAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },

    paidAt: {
      type: Date,
    },
  },

  {
    timestamps: true,
  },
);

export const Order = model<IOrder>('Order', orderSchema);
