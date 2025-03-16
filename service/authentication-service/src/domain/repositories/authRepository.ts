import { Auth } from '../entities/auth';

export interface AuthRepository {
  create(auth: Omit<Auth, 'userId'> & { userId: string }): Promise<Auth>;
  findByEmail(email: string): Promise<Auth | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
}