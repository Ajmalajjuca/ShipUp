import { User } from '../../domain/entities/user';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  updateWalletBalance(userId: string, amount: number): Promise<User>;
}