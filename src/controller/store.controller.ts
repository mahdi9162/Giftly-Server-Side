import { Request, Response } from 'express';
import { IStore } from '../types/store.interface';
import { Store } from '../model/store/store.model';

// getStoreSettings
const getStoreSettings = async (req: Request, res: Response) => {
  try {
    const storeData = await Store.findOne({});

    // if not found
    if (!storeData) {
      return res.status(404).json({
        success: false,
        message: 'Store data not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Store data fetched successfully',
      data: storeData,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch store data',
    });
  }
};

// updateStoreSettings
const updateStoreSettings = async (req: Request, res: Response) => {
  try {
    const fields: (keyof IStore)[] = ['storeName', 'supportEmail', 'phone', 'address', 'currency', 'logoUrl'];

    const updateData: Partial<IStore> = {};

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
    }

    const updatedStore = await Store.findOneAndUpdate({}, updateData, { new: true, upsert: true, runValidators: true });

    return res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: updatedStore,
    });
  } catch (error) {
    console.error('Failed to update store', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update store',
    });
  }
};

export const StoreController = {
  updateStoreSettings,
  getStoreSettings,
};
