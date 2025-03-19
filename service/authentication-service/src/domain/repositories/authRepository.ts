import { Auth } from '../entities/auth';

export interface AuthRepository {
  create(userData: {
    userId: string;
    email: string;
    password: string;
    role: 'user' | 'driver' | 'admin';
  }): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findById(id: string): Promise<any>;
  update(userId: string, data: Partial<Auth>): Promise<Auth>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  delete(userId: string): Promise<void>;
}