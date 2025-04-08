import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepositoryImpl } from '../../infrastructure/repositories/userRepositoryImpl';

const userRepository = new UserRepositoryImpl();

const API_URL = process.env.API_URL || 'http://localhost:3002';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
        role: string;
        status?: boolean;  // Add status to the type
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No token provided in request headers');
      res.status(401).json({ 
        success: false, 
        message: 'No token provided',
        error: 'missing_token'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Invalid token format in request headers');
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token format',
        error: 'invalid_token_format'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        email: string;
        role: string;
      };

      // Get user from database
      const user = await userRepository.findById(decoded.userId);
      
      // Check if user exists and status is false
      if (!user) {
        console.log(`User not found with ID: ${decoded.userId}`);
        res.status(401).json({ 
          success: false, 
          message: 'User not found', 
          error: 'user_not_found'
        });
        return;
      }

      // Check user status
      if (user.status === false) {
        console.log(`User is blocked: ${decoded.userId}`);
        res.status(401).json({ 
          success: false, 
          message: 'Your account has been blocked. Please contact admin for support.',
          isDeactivated: true,
          redirect: '/login',
          error: 'account_blocked'
        });
        return;
      }

      // Add user info to request object
      if (user.profileImage) {
        // Add full URL for profile image
        user.profileImage = `${API_URL}/uploads/${user.profileImage}`;
      }
      
      req.user = { 
        ...decoded, 
        ...user 
      };

      next();
    } catch (error: any) {
      console.log('JWT verification failed:', error.message);
      let errorMessage = 'Invalid token';
      let errorCode = 'invalid_token';
      
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
        errorCode = 'token_expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
        errorCode = 'invalid_token';
      }
      
      res.status(401).json({ 
        success: false, 
        message: errorMessage,
        error: errorCode
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
}; 