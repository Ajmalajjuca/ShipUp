import { ActiveOrderRepository } from '../../../domain/repositories/active-order-repository';
import { ActiveOrder } from '../../../domain/entities/active-order';

export class GetActiveOrderUseCase {
  constructor(private activeOrderRepository: ActiveOrderRepository) {}
  
  async execute(userId: string): Promise<ActiveOrder | null> {
    if (!userId) throw new Error('User ID is required');
    
    return await this.activeOrderRepository.getActiveOrder(userId);
  }
} 