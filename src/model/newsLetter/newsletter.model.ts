import { model, Schema } from 'mongoose';
import { INewsletterSubscriber } from '../../types/newsLetter.interface';

const newsLetterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
    },
    source: {
      type: String,
      enum: ['homepage', 'footer'],
      default: 'homepage',
    },
  },
  {
    timestamps: true,
  },
);

export const NewsLetterSubscriber = model<INewsletterSubscriber>('NewsLetterSubscriber', newsLetterSubscriberSchema);
