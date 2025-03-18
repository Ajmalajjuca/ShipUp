import { AuthRepository } from '../repositories/authRepository';
import { OtpService } from '../../application/services/otpService';
import { EmailService } from '../../application/services/emailService';

export class SendOtp {
  constructor(
    private authRepo: AuthRepository,
    private otpService: OtpService,
    private emailService: EmailService
  ) {}

  async execute(email: string): Promise<{ success: boolean; error?: string }> {
    

    const otp = this.otpService.generateOtp();
    // await this.emailService.sendOtpEmail(email, otp);
    await this.otpService.storeOtp(email, otp);
    

    return { success: true };
  }
}