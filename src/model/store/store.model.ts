import { model, Schema } from 'mongoose';
import { IStore } from '../../types/store.interface';

const storeSchema = new Schema<IStore>(
  {
    storeName: { type: String },
    supportEmail: { type: String },
    address: { type: String },
    phone: { type: String },
    currency: { type: String },
    logoUrl: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Store = model<IStore>('Store', storeSchema);
