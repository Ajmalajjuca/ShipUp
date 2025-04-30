import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
       res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
      return;
    }
    
    try {
      // For microservices, we typically validate the token with an auth service
      // We'll simulate this with a simple check for now
      // In production, you would call your auth service to validate the token
      
      // Option 1: Use environment variable for auth service URL
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      
      const response = await axios.post(`${authServiceUrl}/auth/verify-token`, {},{headers: { Authorization: `Bearer ${token}` }});
      
      if (response.data.success) {
        // Set user info from the verified token
        req.user = response.data.user;
        next();
      } else {
         res.status(401).json({
          success: false,
          message: 'Token is not valid'
        });
        return
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Development mode: Bypassing token verification');
        
        // Extract userId from the request
        const userId = req.params.userId || 'test-user';
        
        // Set a mock user
        req.user = { userId };
        next();
        return;
      }
      
       res.status(401).json({
        success: false,
        message: 'Token verification failed'
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
     res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
    return;
  }
}; 