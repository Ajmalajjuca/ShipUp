import { ActiveOrderRepository } from '../../../domain/repositories/active-order-repository';
import { ActiveOrder } from '../../../domain/entities/active-order';

export class StoreActiveOrderUseCase {
  constructor(private activeOrderRepository: ActiveOrderRepository) {}
  
  async execute(userId: string, orderData: ActiveOrder, ttl?: number): Promise<void> {
    if (!userId) throw new Error('User ID is required');
    if (!orderData.orderId) throw new Error('Order ID is required');
    if (!orderData.driverId) throw new Error('Driver ID is required');
    
    // Ensure timestamp is set
    orderData.timestamp = orderData.timestamp || Date.now();
    
    await this.activeOrderRepository.storeActiveOrder(userId, orderData, ttl);
  }
} 