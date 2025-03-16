export interface Auth {
  userId: string;
  email: string;
  password: string;
  role: 'user' | 'driver' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}