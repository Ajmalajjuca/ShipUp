import { Transaction } from '../../../../domain/entities/transaction';
import { TransactionRepository } from '../../../../domain/repositories/transaction.repository';
import { TransactionModel, ITransaction } from '../../mongo/models/transaction.model';

export class MongooseTransactionRepository implements TransactionRepository {
  async create(transaction: Transaction): Promise<Transaction> {
    try {
      const newTransaction = new TransactionModel(transaction);
      const savedTransaction = await newTransaction.save();
      console.info(`Transaction created: ${savedTransaction.id}`);
      return this.mapToDomain(savedTransaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    try {
      const transactions = await TransactionModel.find({ userId }).sort({ date: -1 }).exec();
      console.info(`Fetched ${transactions.length} transactions for user: ${userId}`);
      return transactions.map(this.mapToDomain);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  private mapToDomain(doc: ITransaction): Transaction {
    return {
      id: doc.id,
      userId: doc.userId,
      type: doc.type,
      amount: doc.amount,
      description: doc.description,
      date: doc.date,
    };
  }
}