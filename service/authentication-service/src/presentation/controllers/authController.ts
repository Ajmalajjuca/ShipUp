import { Request, Response } from 'express';
import { RegisterUser } from '../../domain/use-cases/user/registerUser';
import { LoginUser } from '../../domain/use-cases/user/loginUser';
import { ResetPassword } from '../../domain/use-cases/user/resetPassword';
import { UserRepositoryImpl } from '../../infrastructure/repositories/userRepositoryImpl';
import { AuthService } from '../../application/services/authService';
import { OtpService } from '../../application/services/otpService';
import { User } from '../../domain/entities/user';


const userRepository = new UserRepositoryImpl();
const authService = new AuthService();
const otpService = new OtpService();

const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository);
const resetPassword = new ResetPassword(userRepository);


// Define controller type
interface AuthController {
  register: (req: Request, res: Response) => Promise<void>;
  login: (req: Request, res: Response) => Promise<void>;
  verifyOtp: (req: Request, res: Response) => Promise<void>;
  resetPassword: (req: Request, res: Response) => Promise<void>;
  protected: (req: Request, res: Response) => Promise<void>;
}

export const authController: AuthController = {
  register: async (req: Request, res: Response) => {
    try {      
      const { fullName, phone, email, password } = req.body;

      if (!fullName || !phone || !email || !password) {
        res.status(400).json({ error: 'All fields are required.' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format.' });
        return;
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        res.status(400).json({
          error: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        });
        return;
      }

      const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
      console.log(!phoneRegex.test(phone));
      if (!phoneRegex.test(phone)) {
        
        res.status(400).json({ error: 'Invalid phone number format.' });
        return;
      }

      const result = await registerUser.execute(fullName, phone, email, password);
      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      const user = result.user as User;
      const token = authService.generateToken(user);
      const otp = otpService.generateOtp();
      otpService.storeOtp(email, otp, user);      

      res.status(201).json({
        message: 'User registered successfully! Please verify your email.',        user,
        token
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'All fields are required.' });
        return;
      }

      const user = await loginUser.execute(email, password);
      console.log('user:>',user);
      
      
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password...' });
        return;
      }
      const token = authService.generateToken(user);
      

      res.status(200).json({
        message: 'Login successful!',
        user,
        token
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  verifyOtp: async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const { isValid, user } = await otpService.verifyOtp(email, otp);
    if (!isValid || !user) {
      res.status(400).json({ error: 'Invalid OTP or user data not found' });
      return;
    }

    // Persist the user to the database after OTP verification
    try {
      await userRepository.create(user);
      await userRepository.update(email, { isVerified: true });
      console.log(`User ${email} successfully created and verified.`);
    } catch (error) {
      console.error(`Error persisting user ${email}:`, error);
      res.status(500).json({ error: 'Failed to save user' });
      return;
    }

    res.status(200).json({ message: 'Email verified successfully' });
  },
  
  
  resetPassword: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword } = req.body;
  
      if (!email || !newPassword) {
        res.status(400).json({ error: 'Email and new password are required.' });
        return;
      }
  
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        res.status(400).json({
          error: 'Password must be at least 8 characters long and include letters, numbers, and a special character.',
        });
        return;
      }
  
      await resetPassword.execute(email, newPassword);
  
      res.status(200).json({ message: 'If the email is valid, you will receive password reset instructions.' });
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Something went wrong. Please try again later.' });
    }
  },
  
  protected: async (req: Request, res: Response) => {
    res.json({ message: 'Protected route accessed', user: req.user });
  },
 

};