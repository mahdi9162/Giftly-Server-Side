export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'blocked';
}
