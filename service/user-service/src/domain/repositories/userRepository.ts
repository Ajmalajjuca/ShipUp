import { User } from '../entities/user';

export interface UserRepository {
  create(user: User): Promise<User>;
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(userId: string, data: Partial<User>): Promise<User>;
  delete(userId: string): Promise<boolean>;
  findAll(): Promise<User[]>;
  findByIdAndUpdate(userId: string, updateData: Partial<User>): Promise<User | null>;
}