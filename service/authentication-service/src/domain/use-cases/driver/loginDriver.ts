import { DriverRepository } from '../../repositories/driverRepository';
import { OtpService } from '../../../application/services/otpService';
import { EmailService } from '../../../application/services/emailService';
import { Driver } from '../../entities/driver';

export class LoginDriver {
  constructor(
    private driverRepository: DriverRepository,
    private otpService: OtpService,
    private emailService: EmailService
  ) {}

  async execute(email: string): Promise<{ success: boolean; message: string,driver?:Driver,otp?:string }> {
    try {
      // Check if driver exists
      const driver = await this.driverRepository.findByEmail(email);
      
      if (!driver) {
        return { 
          success: false, 
          message: 'Email not registered as a delivery partner' 
        };
      }
      


      // Generate OTP
      const otp = this.otpService.generateOtp();
      
      // Set OTP expiry (10 minutes from now)
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      
      // Save OTP to driver record
      await this.driverRepository.updateOtp(email, otp, otpExpiry);
      
      // Send OTP email
      // await this.emailService.sendOtpEmail(email,otp);
      console.log(`OTP for ${email}: ${otp}`);
      return { 
        success: true, 
        message: 'OTP sent successfully' ,
        driver,
        otp,
      };
    } catch (error) {
      console.error('Error in LoginDriver use case:', error);
      return { 
        success: false, 
        message: 'Failed to send OTP', 
      };
    }
  }
}