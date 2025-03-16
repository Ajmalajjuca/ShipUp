import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
        role: string;
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

    const token = authHeader.split(' ')[1]; // Remove 'Bearer ' prefix
    if (!token) {
      res.status(401).json({ success: false, message: 'Invalid token format' });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        email: string;
        role: string;
      };

      // Add user info to request object
      req.user = decoded;
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