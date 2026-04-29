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
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware / hook : will run before saving a document
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Hash password using bcrypt salt rounds from config
  this.password = await bcrypt.hash(this.password as string, Number(config.bcrypt_salt_rounds));
});

// Post-save middleware / hook : will run directly after saving a document
userSchema.post('save', function (user) {
  user.password = '';
});

export const User = model<IUser>('User', userSchema);
