import { User } from '../model/user/user.model';
import { IUser } from '../types/user.interface';
import bcrypt from 'bcryptjs';

// update profile info
export const updateMyProfileIntoDB = async (userId: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true }).select('-password');

  return result;
};

// update profile image
export const updateMyProfileImageIntoDB = async (userId: string, profileImage: string) => {
  const result = await User.findByIdAndUpdate(userId, { profileImage }, { new: true, runValidators: true }).select('-password');

  return result;
};

// update password
export const updateMyPasswordIntoDB = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordMatch = await bcrypt.compare(currentPassword, user.password as string);

  if (!isPasswordMatch) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;

  await user.save();

  return user;
};
