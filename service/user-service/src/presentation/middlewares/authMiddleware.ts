import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepositoryImpl } from '../../infrastructure/repositories/userRepositoryImpl';
import { ResponseHandler } from '../utils/responseHandler';
import { ErrorMessage } from '../../types/enums/ErrorMessage';
import { ErrorCode } from '../../types/enums/ErrorCode';

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
        status?: boolean;
        profileImage?: string;
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
      ResponseHandler.unauthorized(res, ErrorMessage.AUTH_HEADER_REQUIRED, ErrorCode.AUTH_HEADER_REQUIRED);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      ResponseHandler.unauthorized(res, 'Invalid token format', 'INVALID_TOKEN_FORMAT');
      return;
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
        email: string;
        role: string;
      };

      // Get user from database
      const user = await userRepository.findById(decoded.userId);
      
      // Check if user exists
      if (!user) {
        ResponseHandler.unauthorized(res, ErrorMessage.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        return;
      }

      // Check user status
      if (user.status === false) {
        ResponseHandler.unauthorized(
          res, 
          'Your account has been blocked. Please contact admin for support.',
          'ACCOUNT_BLOCKED',
          { 
            isDeactivated: true,
            redirect: '/login'
          }
        );
        return;
      }

      // Add user info to request object
      if (user.profileImage) {
        // Add full URL for profile image
        user.profileImage = `${user.profileImage}`;
      }
      
      req.user = { 
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        status: user.status,
        profileImage: user.profileImage
      };

      next();
    } catch (error: any) {
      let errorMessage = 'Invalid token';
      let errorCode = ErrorCode.INVALID_TOKEN;
      
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
        errorCode = ErrorCode.TOKEN_EXPIRED;
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
        errorCode = ErrorCode.INVALID_TOKEN;
      }
      
      ResponseHandler.unauthorized(res, errorMessage, errorCode);
      return;
    }
  } catch (error) {
    ResponseHandler.handleError(res, error);
    return;
  }
}; 