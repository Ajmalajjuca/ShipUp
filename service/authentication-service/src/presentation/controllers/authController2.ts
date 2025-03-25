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
import bcrypt from 'bcrypt';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";
import { client } from '../../server';
import { GoogleAuthUser } from '../../domain/use-cases/googleAuthUser';
import { UserService } from '../../application/services/userService';

const authRepository = new AuthRepositoryImpl();
const authService = new AuthService();
const otpService = new OtpService();
const emailService = new EmailService();
const userService = new UserService();
const googleAuthUser = new GoogleAuthUser(authRepository, authService, userService);

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
      const authData: { userId: string; email: string; password: string; role: 'user' | 'driver' | 'admin' } = {
        userId: partnerId || `DRV-${authService.generateUserId()}`,
        email,
        password: '', // or generate a random password if needed
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
      if (!result.success || !result.authUser || !result.token) {
        res.status(401).json({ success: false, error: result.error || 'Login failed' });
        return;
      }

      // Get user details from user service
      try {
        const userResponse = await axios.get(
          `${process.env.USER_SERVICE_URL}/users/${result.authUser.userId}`,
          {
            headers: { Authorization: `Bearer ${result.token}` }
          }
        );

        
        if (userResponse.data.user && !userResponse.data.user.status) {
          res.status(403).json({
            success: false,
            error: 'Your account has been blocked. Please contact admin for support.'
          });
          return;
        }
        const userData = {
          ...result.authUser,
          ...userResponse.data.user // This will include the profileImage URL
        };
        

        res.status(200).json({
          success: true,
          message: 'Login successful',
          user: userData,
          token: result.token
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(200).json({
          success: true,
          message: 'Login successful',
          user: result.authUser,
          token: result.token
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
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

      try{
        const driverResponse = await axios.get(
          `${process.env.PARTNER_SERVICE_URL}/drivers/${authUser.userId}`,
          
        )
        console.log('driverResponse::',driverResponse.data.partner.status);
        
        if (driverResponse.data.partner && !driverResponse.data.partner.status) {
          res.status(403).json({
            success: false,
            error: 'Your account has been blocked. Please contact admin for support.'
          });
          return;
        }
      }
      catch(error){
        console.error('Error fetching driver details:', error);
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
        res.status(400).json({ success: false, message: 'Email and OTP are required' });
        return;
      }

      // Verify OTP
      const verificationResult = await otpService.verifyOtp(email, otp);
      if (!verificationResult.isValid) {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        return;
      }

      // Get partner record
      const partner = await authRepository.findByEmail(email);
      if (!partner) {
        res.status(404).json({ success: false, message: "Partner not found" });
        return;
      }

      // Verify partner role
      if (partner.role !== 'driver') {
        res.status(403).json({ success: false, message: "Not authorized as partner" });
        return;
      }

      // Generate token
      const token = authService.generateToken(partner.userId, email, 'driver');
      
      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        token,
        partnerId: partner.userId,
        email: partner.email,
        role: 'driver'
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ success: false, message: "Internal server error" });
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
      const { email, otp, newPassword } = req.body;
      const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : '';
      if (!email || !otp) {
        res.status(400).json({ success: false, error: 'Email and OTP are required' });
        return;
      }

      const result = await verifyOtp.execute(email, otp, hashedPassword);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // If newPassword is provided, this was a password reset flow
      if (newPassword) {
        res.status(200).json({
          success: true,
          message: 'Password reset successful'
        });
        return;
      }

      // Normal OTP verification flow
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        token: result.token
      });
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
        return;
      }

      // Verify user exists
      const user = await authRepository.findByEmail(email);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Send OTP
      const result = await sendOtp.execute(email);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Store the temporary token for password reset flow
      const tempToken = authService.generateToken(user.userId, email, user.role);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        token: tempToken // Frontend will use this for OTP verification
      });
      
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
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

  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ valid: false, message: 'No token provided' });
        return 
      }

      const token = authHeader.split(' ')[1]; // Remove 'Bearer ' prefix
      if (!token) {
        res.status(401).json({ valid: false, message: 'Invalid token format' });
        return 
      }

      try {
        // Verify token using your JWT service or auth service
        const decoded = await authService.verifyToken(token);
        res.status(200).json({ valid: true, user: decoded });
        return 
      } catch (error) {
        res.status(401).json({ valid: false, message: 'Invalid token' });
        return 
      }
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ valid: false, message: 'Internal server error' });
      return 
    }
  },

  async verifyPassword(req: Request, res: Response) {
    try {
      const { userId, password } = req.body;
      
      const user = await authRepository.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      res.status(200).json({ success: isValid });
    } catch (error) {
      console.error('Password verification error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  async updatePassword(req: Request, res: Response) {
    try {
      const { userId,currentPassword , newPassword } = req.body;
      

      const user = await authRepository.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      
      if(isValid){

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await authRepository.updatePassword(userId, hashedPassword);
        
        res.status(200).json({ success: true, message: 'Password updated successfully' });
      }else{
        res.status(404).json({ success: false, message: 'Current password is wrong' });

      }
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  },

  async verifyPartnerToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const { email } = req.body;

      if (!token || !email) {
         res.status(401).json({
          success: false,
          message: 'No token or email provided'
        });
        return
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check if the token belongs to the partner
      if (decoded.email !== email || decoded.role !== 'driver') {
         res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
        return
      }

      res.json({
        success: true,
        message: 'Token is valid'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  },

  async googleLogin(req: Request, res: Response) {
    try {
      const { credential } = req.body;
      
      if (!credential) {
        res.status(400).json({ success: false, error: "Google token is required" });
        return;
      }


      // Verify the Google token
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        
        if (!payload || !payload.email) {
          res.status(400).json({ success: false, error: "Invalid token" });
          return;
        }

        const result = await googleAuthUser.execute({
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        });

        if (!result.success) {
          res.status(400).json(result);
          return;
        }

        res.status(200).json(result);
      } catch (verifyError: any) {
        console.error('Token verification error:', {
          error: verifyError.message,
          clientId: process.env.GOOGLE_CLIENT_ID,
          stack: verifyError.stack
        });
        res.status(401).json({ 
          success: false, 
          error: "Token verification failed",
          details: verifyError.message
        });
        return;
      }
    } catch (error: any) {
      console.error('Google authentication error:', error);
      res.status(400).json({ success: false, error: "Authentication failed" });
    }
  },

  async updateEmail(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required'
        });
        return;
      }

      // Check if email is already in use by another user
      const existingUser = await authRepository.findByEmail(email);
      if (existingUser && existingUser.userId !== partnerId) {
        res.status(400).json({
          success: false,
          error: 'Email is already in use by another user'
        });
        return;
      }

      // Update the email
      const updatedUser = await authRepository.updateEmail(partnerId, email);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Email updated successfully',
        user: {
          userId: updatedUser.userId,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });

    } catch (error) {
      console.error('Update email error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

};