import { model, Schema } from 'mongoose';
import { IUser } from '../../types/user.interface';
import bcrypt from 'bcryptjs';
import config from '../../config';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware / hook : will run before saving a document
userSchema.pre('save', async function () {
  // 'this' refers to the document about to be saved
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return;
  }

  // Hash password using bcrypt salt rounds from config
  user.password = await bcrypt.hash(user.password as string, Number(config.bcrypt_salt_rounds));
});

// Post-save middleware / hook : will run directly after saving a document
userSchema.post('save', function (user) {
  user.password = '';
});

export const User = model<IUser>('User', userSchema);
