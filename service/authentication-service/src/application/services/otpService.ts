// src/application/services/otpService.ts
import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { RedisClientType, createClient } from 'redis';
import { Auth } from '../../domain/entities/auth';

export class OtpService {
  private redisClient: RedisClientType;
  private readonly OTP_EXPIRATION_SECONDS = 60; 

  constructor() {
    this.redisClient = createClient({ url: process.env.REDIS_URL });

    this.redisClient.connect()
      .then(() => console.log('Connected to Redis'))
      .catch((err: any) => console.error('Redis connection failed:', err));
  }

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async storeOtp(email: string, otp: string): Promise<void> {
    try {
      const hashedOtp = await bcrypt.hash(otp, 10); // Secure OTP storage

      // Store OTP and user in Redis with the same expiration
      await Promise.all([
        this.redisClient.setEx(`${email}:otp`, this.OTP_EXPIRATION_SECONDS, hashedOtp),
      ]);

      console.log(`OTP for ${email}: ${otp}`); // Simulate email sending
    } catch (error) {
      console.error(`Error storing OTP and user for ${email}:`, error);
      throw error; // Re-throw to handle in caller
    }
  }

  async verifyOtp(email: string, enteredOtp: string): Promise<{ isValid: boolean; user?: Auth }> {
    try {
      
      const storedHashedOtp = await this.redisClient.get(`${email}:otp`);
      if (!storedHashedOtp) {
        return { isValid: false };
      }
      
      const isMatch = await bcrypt.compare(enteredOtp, storedHashedOtp);

      if (!isMatch) {
        return { isValid: false };
      }


      // OTP is valid and used, clear both OTP and user data
      await Promise.all([
        this.redisClient.del(`${email}:otp`),
      ]);

      return { isValid: true };
    } catch (error) {
      console.error(`Error verifying OTP for ${email}:`, error);
      return { isValid: false };
    }
  }

  async clearOtp(email: string): Promise<void> {
    try {
      await Promise.all([
        this.redisClient.del(`${email}:otp`),
      ]);
    } catch (error) {
      console.error(`Error clearing OTP and user for ${email}:`, error);
    }
  }
}