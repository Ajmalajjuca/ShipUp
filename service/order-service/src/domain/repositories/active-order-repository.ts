import { ActiveOrder } from '../entities/active-order';

export interface ActiveOrderRepository {
  /**
   * Store an active order for a user
   * @param userId The ID of the user
   * @param order The active order data
   * @param ttl Optional time-to-live in seconds (default: 24 hours)
   */
  storeActiveOrder(userId: string, order: ActiveOrder, ttl?: number): Promise<void>;
  
  /**
   * Get the active order for a user
   * @param userId The ID of the user
   * @returns The active order or null if not found
   */
  getActiveOrder(userId: string): Promise<ActiveOrder | null>;
  
  /**
   * Remove the active order for a user
   * @param userId The ID of the user
   */
  removeActiveOrder(userId: string): Promise<void>;
} 