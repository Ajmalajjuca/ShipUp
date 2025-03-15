import { Request, Response } from 'express';
import { RegisterUser } from '../../domain/use-cases/registerUser';
import { LoginUser } from '../../domain/use-cases/loginUser';
import { SendOtp } from '../../domain/use-cases/sendOtp';
import { VerifyOtp } from '../../domain/use-cases/verifyOtp';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/authRepositoryImpl';
import { AuthService } from '../../application/services/authService';
import { OtpService } from '../../application/services/otpService';
import { EmailService } from '../../application/services/emailService';
import multer from 'multer';

const authRepository = new AuthRepositoryImpl();
const authService = new AuthService();
const otpService = new OtpService();
const emailService = new EmailService();

const registerUser = new RegisterUser(authRepository, authService, otpService, emailService);
const loginUser = new LoginUser(authRepository, authService);
const sendOtp = new SendOtp(authRepository, otpService, emailService);
const verifyOtp = new VerifyOtp(otpService, authService, authRepository);

const upload = multer({ dest: 'uploads/' }); // For handling multipart/form-data from Partner Service

export const authController = {
  // Existing user registration (password required)
  async register(req: Request, res: Response) {
    try {
      const { email, password, role, fullName, phone } = req.body;
      if (!email || !password || !role || !fullName || !phone) {
        res.status(400).json({ success: false, error: 'All fields are required' });
        return;
      }

      const result = await registerUser.execute(email, password, role, { fullName, phone });
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json({
        success: true,
        message: result.message,
        token: authService.generateToken(result.userId || '', email, role),
        user: { email, role, fullName, phone }
      });
      return;
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },

  // New driver registration (no password, from Partner Service)
  async registerDriver(req: Request, res: Response) {
    try {
      const { email, role, partnerId } = req.body;

      if (!email || !role || role !== 'driver') {
        res.status(400).json({ success: false, error: 'Email and role=driver are required' });
        return;
      }

      // Check if email already exists
      const existingUser = await authRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Email already exists' });
        return;
      }

      // Store email and role directly in the database (no OTP)
      const authData: { userId: string; email: string; role: 'user' | 'driver' | 'admin' } = {
        userId: partnerId || `DRV-${authService.generateUserId()}`,
        email,
        role: 'driver',
      };

      await authRepository.create(authData);

      res.status(201).json({
        success: true,
        message: 'Driver email registered successfully',
        user: { email, role: 'driver', partnerId: authData.userId }
      });
      return;
    } catch (error) {
      console.error('Driver registration error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },

  // Existing user login (password-based)
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
      }
      

      const result = await loginUser.execute(email, password);
      if (!result.success) {
        res.status(401).json({ success: false, error: result.error });
        return;
      }
      console.log('result.user>>',result.authUser);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user:result.userinfo,
        role: result.authUser,
        token: result.token
      });
      return;
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },

  // New driver login OTP request
  async requestLoginOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }

      const authUser = await authRepository.findByEmail(email);
      if (!authUser) {
        res.status(404).json({ success: false, error: 'Email not registered' });
        return;
      }

      if (authUser.role === 'user') {
        res.status(400).json({ success: false, error: 'Use password-based login for users' });
        return;
      }

      const otp = otpService.generateOtp();
      await otpService.storeOtp(email, otp);
      await emailService.sendOtpEmail(email, otp);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email for login'
      });
      return;
    } catch (error) {
      console.error('Login OTP request error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },

  // New driver login OTP verification
  async verifyLoginOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ success: false, error: 'Email and OTP are required' });
        return;
      }

      const isValid = await otpService.verifyOtp(email, otp);
      if (!isValid) {
        res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
        return;
      }

      const authUser = await authRepository.findByEmail(email);
      if (!authUser) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      if (authUser.role === 'user') {
        res.status(400).json({ success: false, error: 'Use password-based login for users' });
        return;
      }

      const token = authService.generateToken(authUser.userId, authUser.email, authUser.role);
      await otpService['redisClient'].del(`${email}:otp`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          userId: authUser.userId,
          email: authUser.email,
          role: authUser.role,
          // fullName will be fetched in VerifyOtp for registration, not here
        },
        token
      });
      return;
    } catch (error) {
      console.error('Login OTP verification error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },

  // Existing send OTP (unchanged)
  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }
      
      const result = await sendOtp.execute(email);
      console.log('result...',result);
      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.success ? 'OTP sent successfully' : result.error
      });
      return;
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },

  // Existing verify OTP (unchanged, handles registration verification)
  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ success: false, error: 'Email and OTP are required' });
        return;
      }
      

      const result = await verifyOtp.execute(email, otp);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        token: result.token
      });
      return;
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },
  async delete(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await authRepository.delete(userId);
      res.status(200).json({ success: true, message: 'User deleted' });
      return;
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },

};