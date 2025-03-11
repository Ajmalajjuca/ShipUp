import { UserRepository } from '../../repositories/userRepository';
import { DriverRepository } from '../../repositories/driverRepository';
import { OtpService } from '../../../application/services/otpService';
import { AuthService } from '../../../application/services/authService';

export class VerifyOtp {
  constructor(
    private userRepository: UserRepository,
    private driverRepository: DriverRepository,
    private otpService: OtpService,
    private authService: AuthService
  ) {}

  async execute(
    email: string, 
    otp: string, 
    role: 'user' | 'driver'
  ): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      // Verify OTP
      const { isValid, user } = await this.otpService.verifyOtp(email, otp);
      if (!isValid || !user) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      if (role === 'user') {
        // Persist user to database and mark as verified
        await this.userRepository.create(user);
        await this.userRepository.update(email, { isVerified: true });
        console.log(`User ${email} successfully created and verified.`);
        return { success: true, message: 'User verified successfully' };
      }

      if (role === 'driver') {
        // Generate JWT token for driver
        const token = this.authService.generateToken({
          id: user.id,
          email: user.email,
          role: 'driver'
        });
        console.log(`Driver ${email} successfully verified.`);
        return { success: true, message: 'Driver verified successfully', token };
      }

      return { success: false, message: 'Invalid role specified' };
    } catch (error) {
      console.error('Error in VerifyOtp use case:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
}
