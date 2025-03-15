import { AuthRepository } from '../repositories/authRepository';
import { AuthService } from '../../application/services/authService';
import { OtpService } from '../../application/services/otpService';
import { EmailService } from '../../application/services/emailService';
import bcrypt from 'bcrypt';

export class RegisterUser {
  constructor(
    private authRepo: AuthRepository,
    private authService: AuthService,
    private otpService: OtpService,
    private emailService: EmailService
  ) {}

  async execute(
    email: string,
    password: string | undefined, // Password is optional for drivers
    role: 'user' | 'driver',
    additionalData: { fullName?: string; phone?: string; [key: string]: any } // Flexible for driver data
  ): Promise<{ success: boolean; message?: string; error?: string; userId?: string }> {
    try {
      const existingUser = await this.authRepo.findByEmail(email);
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }

      // Validate phone number if provided (required for users, optional for drivers)
      if (additionalData.phone) {
        const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
        if (!phoneRegex.test(additionalData.phone)) {
          return { success: false, error: 'Invalid phone number format' };
        }
      }

      // Require password for users, not for drivers
      const passwordRegex:RegExp  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (role === 'user' && (!password || !passwordRegex.test(password))) {
        return { success: false, error: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.' };
      }

      // Generate userId with a prefix for drivers
      const userId = role === 'driver' ? `DRV-${this.authService.generateUserId()}` : `USR-${this.authService.generateUserId()}`;

      // Hash password only if provided (for users)
      const authData = {
        userId,
        email,
        role,
        ...(role === 'user' && password ? { password: await bcrypt.hash(password, 10) } : {})
      };

      const otp = this.otpService.generateOtp();
      await this.otpService.storeOtp(email, otp);

      // Store all additional data (flexible for both user and driver fields)
      
      const pendingData = JSON.stringify({ authData, additionalData });
      await this.otpService['redisClient'].setEx(`${email}:pending`, 300, pendingData);

      await this.emailService.sendOtpEmail(email, otp);
      console.log('done');
      return { 
        success: true, 
        message: 'OTP sent to your email for verification',
        userId 
      };
      
    } catch (error) {
      console.log('err');
      
      console.error('Registration error:', error);
      await this.otpService['redisClient'].del(`${email}:otp`);
      await this.otpService['redisClient'].del(`${email}:pending`);
      return { success: false, error: 'Registration failed' };
    }
  }
}


