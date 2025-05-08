import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { TransactionDto } from '../../dtos/transaction.dto';

export class GetTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(userId: string): Promise<TransactionDto[]> {
    const transactions = await this.transactionRepository.findByUserId(userId);
    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }));
  }
}