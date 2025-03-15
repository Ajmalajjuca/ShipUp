import { OtpService } from '../../application/services/otpService';
import { AuthService } from '../../application/services/authService';
import { AuthRepository } from '../repositories/authRepository';
import axios from 'axios';

export class VerifyOtp {
  constructor(
    private otpService: OtpService,
    private authService: AuthService,
    private authRepo: AuthRepository
  ) {}

  async execute(email: string, otp: string): Promise<{ success: boolean; error?: string; token?: string }> {
    try {
      
      const result = await this.otpService.verifyOtp(email, otp);
      console.log('isValid....',result);

      if (!result.isValid) {
        return { success: false, error: 'Invalid or expired OTP' };
      }

      
      const pendingDataJson = await this.otpService['redisClient'].get(`${email}:pending`);
      if (!pendingDataJson) {
        return { success: false, error: 'No pending registration found' };
      }
      
      const { authData, additionalData } = JSON.parse(pendingDataJson);
      const { userId, role } = authData;
      
      await this.authRepo.create(authData);
      
      const serviceUrl = role === 'user' ? process.env.USER_SERVICE_URL : process.env.PARTNER_SERVICE_URL;
      try {
        await axios.post(`${serviceUrl}/${role === 'user' ? 'users' : 'drivers'}`, {
          ...(role === 'user' ? { userId } : { partnerId: userId }),
          email,
          ...additionalData,
        });
      } catch (error) {
        console.error('Downstream service error:',error);
        // Rollback auth creation if downstream fails
        // await this.authRepo.delete(userId);
        return { success: false, error: 'Failed to complete registration' };
      }

      await Promise.all([
        this.otpService['redisClient'].del(`${email}:pending`),
        this.otpService['redisClient'].del(`${email}:otp`)
      ]);

      const token = this.authService.generateToken(userId, email, role);
      return { success: true, token };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: 'OTP verification failed' };
    }
  }
}
