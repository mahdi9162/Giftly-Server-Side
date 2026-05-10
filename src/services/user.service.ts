import { User } from '../model/user/user.model';
import { IUser } from '../types/user.interface';

export const updateMyProfileIntoDB = async (userId: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true }).select('-password');

  return result;
};

export const updateMyProfileImageIntoDB = async (userId: string, profileImage: string) => {
  const result = await User.findByIdAndUpdate(userId, { profileImage }, { new: true, runValidators: true }).select('-password');

  return result;
};
