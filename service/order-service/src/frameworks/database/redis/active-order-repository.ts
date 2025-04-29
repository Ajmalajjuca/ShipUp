import { ActiveOrderRepository } from '../../../domain/repositories/active-order-repository';
import { ActiveOrder } from '../../../domain/entities/active-order';
import { getRedisClient } from './index';

export class RedisActiveOrderRepository implements ActiveOrderRepository {
  private getKey(userId: string): string {
    return `active_order:${userId}`;
  }

  async storeActiveOrder(userId: string, order: ActiveOrder, ttl: number = 86400): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const key = this.getKey(userId);
      
      // Store order data with expiration
      await redisClient.set(key, JSON.stringify(order), { EX: ttl });
      
      console.log(`Active order stored for user ${userId} with TTL of ${ttl} seconds`);
    } catch (error) {
      console.error('Error storing active order in Redis:', error);
      throw new Error('Failed to store active order');
    }
  }

  async getActiveOrder(userId: string): Promise<ActiveOrder | null> {
    try {
      const redisClient = getRedisClient();
      const key = this.getKey(userId);
      
      const data = await redisClient.get(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data) as ActiveOrder;
    } catch (error) {
      console.error('Error retrieving active order from Redis:', error);
      throw new Error('Failed to retrieve active order');
    }
  }

  async removeActiveOrder(userId: string): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const key = this.getKey(userId);
      
      await redisClient.del(key);
      
      console.log(`Active order removed for user ${userId}`);
    } catch (error) {
      console.error('Error removing active order from Redis:', error);
      throw new Error('Failed to remove active order');
    }
  }
} 