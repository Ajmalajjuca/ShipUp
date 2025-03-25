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
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'Invalid token format' });
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
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      // Check user status
      if (user.status === false) {
        res.status(401).json({ 
          success: false, 
          message: 'Your account has been blocked. Please contact admin for support.',
          isDeactivated: true,
          redirect: '/login'  // Add redirect path in response
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
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
}; 