import { User } from '../entities/user';

export interface UserRepository {
  create(user: Omit<User, 'id'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  update(email: string, data: Partial<User>): Promise<User | null>;
  deleteByEmail(email: string): Promise<boolean>;
}
