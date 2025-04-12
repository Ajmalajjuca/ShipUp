import { Request, Response } from 'express';
import { CreateUser } from '../../domain/use-cases/createUser';
import { GetUser } from '../../domain/use-cases/getUser';
import { UpdateUser } from '../../domain/use-cases/updateUser';
import { DeleteUser } from '../../domain/use-cases/deleteUser';
import { UserRepositoryImpl } from '../../infrastructure/repositories/userRepositoryImpl';
import { UserRepository } from '../../domain/repositories/userRepository';
import bcrypt from 'bcrypt';
import { authService } from '../../infrastructure/services/authService';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const userRepository = new UserRepositoryImpl();
const createUser = new CreateUser(userRepository);
const getUser = new GetUser(userRepository);
const updateUser = new UpdateUser(userRepository);
const deleteUser = new DeleteUser(userRepository);

const API_URL = process.env.API_URL || 'http://localhost:3002';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export const userController = {
  async create(req: Request, res: Response) {
    try {
      const { userId, fullName, phone, email } = req.body;
      

      if (!userId || !fullName  || !email) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, fullName, phone, and email are required'
        });
        return
      }

      if(phone){

        const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          res.status(400).json({ success: false, error: 'Invalid phone number format' });
          return
        }
      }

      const result = await createUser.execute({ userId, fullName, phone, email });
      res.status(result.success ? 201 : 400).json(result);
      return
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return
    }
  },

  async get(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const user = await userRepository.findById(userId);
      
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // Add full URL for profile image
      const userData = {
        ...user,
        profileImage: user.profileImage 
          ? `${user.profileImage}`
          : null
      };

      res.status(200).json({ success: true, user: userData });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      if (!userId) {
        res.status(400).json({ success: false, error: 'User ID is required' });
        return
      }

      const result = await updateUser.execute(userId, updateData);
      res.status(result.success ? 200 : 404).json(result);
      return
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({ success: false, error: 'User ID is required' });
        return
      }

      const result = await deleteUser.execute(userId);
      res.status(result.success ? 200 : 404).json(result);
      return
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return
    }
  },


  async updateProfile(req: Request, res: Response) {
    try {

      
      let userId;
      if (req.user && req.user.userId) {
        userId = req.user.userId;
      } else if (req.body.userId) {
        userId = req.body.userId;
      } else {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          shouldClearSession: false
        });
        return;
      }
      
      const { fullName, phone, currentPassword, newPassword, profileImagePath } = req.body;
      const profileImage = req.file;
      
      // Get auth token from headers
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'Authorization header is required',
          shouldClearSession: false
        });
        return;
      }
      
      // If password change is requested, verify with auth service first
      if (currentPassword && newPassword) {
        try {
          const authResponse = await axios.put(`${AUTH_SERVICE_URL}/auth/update-password`, {
            userId,
            currentPassword,
            newPassword
          }, {
            headers: {
              Authorization: authHeader
            }
          });

          const authData = authResponse.data as { success: boolean };
          if (!authData.success) {
            res.status(400).json({
              success: false,
              message: 'Password change failed - current password may be incorrect',
              passwordError: true,
              shouldClearSession: false
            });
            return;
          }
        } catch (error: any) {
          res.status(400).json({
            success: false,
            message: error.response?.data?.message || 'Password change failed - current password may be incorrect',
            passwordError: true,
            shouldClearSession: false
          });
          return;
        }
      }

      // Get user from repository
      const user = await userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ 
          success: false, 
          message: 'User not found',
          shouldClearSession: true
        });
        return;
      }


      // Prepare update data
      const updateData: any = {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(profileImage && { profileImage: (profileImage as Express.MulterS3.File).location }),
        ...(profileImagePath && { profileImage: profileImagePath }) // Use profileImagePath if provided
      };


      // Update user
      const updatedUser = await userRepository.update(userId, updateData);

      // Return the direct S3 URL for the profile image
      const profileImageUrl = updatedUser.profileImage;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...updatedUser,
          profileImage: profileImageUrl
        }
      });
    } catch (error: any) {
      console.error('Update profile error:', error.message, error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update profile',
        shouldClearSession: false
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const users = await userRepository.findAll();
      
      // Add full URL for profile images
      const usersWithFullUrls = users.map(user => ({
        ...user,
        profileImage: user.profileImage 
          ? `${user.profileImage}`
          : null
      }));

      res.status(200).json({ 
        success: true, 
        users: usersWithFullUrls 
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (typeof status !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Status must be a boolean value'
        });
        return;
      }

      const updatedUser = await userRepository.findByIdAndUpdate(
        userId,
        { status }
      );

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  async getByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      
      const user = await userRepository.findByEmail(email);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          userId: user.userId,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Get user by email error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};