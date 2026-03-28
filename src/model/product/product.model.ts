import { model, Schema } from 'mongoose';
import { IProduct } from '../../types/product.interface';

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      enum: ['birthday', 'anniversary', 'for-him', 'for-her', 'family', 'personalized'],
    },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    reviews: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    badge: {
      type: String,
      enum: ['Best Seller', 'New'],
      required: false,
    },
    image: { type: String, required: true },
    alt: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  },
);

export const Product = model<IProduct>('Product', productSchema);
