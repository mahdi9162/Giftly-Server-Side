export interface IUser {
  name: string;
  profileImage: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  password?: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  statusUpdatedAt?: Date;
}

export type UserStatus = {
  status: 'active' | 'inactive' | 'blocked';
};
