import { Auth } from '../entities/auth';

export interface AuthRepository {
  create(auth: Omit<Auth, 'userId'> & { userId: string }): Promise<Auth>;
  findByEmail(email: string): Promise<Auth | null>;
  findById(userId: string): Promise<Auth | null>;
  update(userId: string, data: Partial<Auth>): Promise<Auth>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  delete(userId: string): Promise<void>;
}