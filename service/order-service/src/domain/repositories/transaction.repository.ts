import { Transaction } from '../../domain/entities/transaction';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findByUserId(userId: string): Promise<Transaction[]>;
}