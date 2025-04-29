import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis client configuration
let redisClient: RedisClientType;

export const initRedisClient = async (): Promise<RedisClientType> => {
  try {
    // Create Redis client
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    // Event handlers
    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('Redis Client Connected'));
    redisClient.on('reconnecting', () => console.log('Redis Client Reconnecting'));
    
    // Connect to Redis
    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedisClient first.');
  }
  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect();
    console.log('Redis connection closed');
  }
}; 