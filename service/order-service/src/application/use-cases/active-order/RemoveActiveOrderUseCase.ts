import { ActiveOrderRepository } from '../../../domain/repositories/active-order-repository';

export class RemoveActiveOrderUseCase {
  constructor(private activeOrderRepository: ActiveOrderRepository) {}
  
  async execute(userId: string): Promise<void> {
    if (!userId) throw new Error('User ID is required');
    
    await this.activeOrderRepository.removeActiveOrder(userId);
  }
} 