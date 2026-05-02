export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  statusUpdatedAt?: Date;
}

export type UserStatus = {
  status: 'active' | 'inactive' | 'blocked';
};
