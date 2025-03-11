// src/application/services/otpService.ts
import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { RedisClientType, createClient } from 'redis';
import { User } from '../../domain/entities/user';
import { EmailService } from './emailService';
import { Driver } from '../../domain/entities/driver';

export class OtpService {
  private redisClient: RedisClientType;
  private readonly OTP_EXPIRATION_SECONDS = 300; // 5 minutes
  private emailService: EmailService;

  constructor() {
    this.redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    this.emailService = new EmailService();

    this.redisClient.connect()
      .then(() => console.log('Connected to Redis'))
      .catch((err: any) => console.error('Redis connection failed:', err));
  }

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async storeOtp(email: string, otp: string, pendingUser: User|Driver): Promise<void> {
    try {
      const hashedOtp = await bcrypt.hash(otp, 10); // Secure OTP storage
      const userJson = JSON.stringify(pendingUser); // Serialize user object

      // Store OTP and user in Redis with the same expiration
      await Promise.all([
        this.redisClient.setEx(`${email}:otp`, this.OTP_EXPIRATION_SECONDS, hashedOtp),
        this.redisClient.setEx(`${email}:user`, this.OTP_EXPIRATION_SECONDS, userJson),
      ]);
      await this.emailService.sendOtpEmail(email, otp);
      console.log(`OTP for ${email}: ${otp}`); // Simulate email sending
    } catch (error) {
      console.error(`Error storing OTP and user for ${email}:`, error);
      throw error; // Re-throw to handle in caller
    }
  }

  async verifyOtp(email: string, enteredOtp: string): Promise<{ isValid: boolean; user?: User }> {
    try {
      
      const storedHashedOtp = await this.redisClient.get(`${email}:otp`);
      if (!storedHashedOtp) {
        return { isValid: false };
      }

      const isMatch = await bcrypt.compare(enteredOtp, storedHashedOtp);
      if (!isMatch) {
        return { isValid: false };
      }

      // Retrieve the pending user
      const userJson = await this.redisClient.get(`${email}:user`);
      if (!userJson) {
        return { isValid: false }; // User data missing, invalid state
      }

      const pendingUser: User = JSON.parse(userJson);

      // OTP is valid and used, clear both OTP and user data
      await Promise.all([
        this.redisClient.del(`${email}:otp`),
        this.redisClient.del(`${email}:user`),
      ]);

      return { isValid: true, user: pendingUser };
    } catch (error) {
      console.error(`Error verifying OTP for ${email}:`, error);
      return { isValid: false };
    }
  }

  async clearOtp(email: string): Promise<void> {
    try {
      await Promise.all([
        this.redisClient.del(`${email}:otp`),
        this.redisClient.del(`${email}:user`),
      ]);
    } catch (error) {
      console.error(`Error clearing OTP and user for ${email}:`, error);
    }
  }

  async getPendingUser(email: string): Promise<User | null> {
    try {
      const userJson = await this.redisClient.get(`${email}:user`);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error(`Error retrieving pending user for ${email}:`, error);
      return null;
    }
  }
}