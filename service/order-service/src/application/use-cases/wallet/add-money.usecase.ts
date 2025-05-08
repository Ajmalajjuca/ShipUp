import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Transaction } from '../../../domain/entities/transaction';
import { AddMoneyDto } from '../../dtos/add-money.dto';

export class AddMoneyUseCase {
  constructor(
    private transactionRepository: TransactionRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string, dto: AddMoneyDto): Promise<void> {
    const { amount, paymentIntentId } = dto;

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    // Update user wallet balance
    await this.userRepository.updateWalletBalance(userId, amount);

    // Create transaction
    const transaction: Transaction = {
      id: paymentIntentId,
      userId,
      type: 'credit',
      amount,
      description: 'Add money via Stripe',
      date: new Date(),
    };

    await this.transactionRepository.create(transaction);
  }
}