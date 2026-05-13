import mongoose from 'mongoose';
import config from '../config';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  if (!config.database_url) {
    throw new Error('Database URL is not provided in environment variables');
  }

  await mongoose.connect(config.database_url, {
    family: 4
  });
  isConnected = true;
  console.log('Connected to MongoDB successfully');
};
