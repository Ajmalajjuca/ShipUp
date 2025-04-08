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
          ? `${API_URL}/uploads/${user.profileImage}`
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
      console.log('Update profile request received:', { body: req.body, file: req.file });
      
      // Get userId from token if available or from request body
      let userId;
      if (req.user && req.user.userId) {
        userId = req.user.userId;
        console.log('Using userId from authenticated token:', userId);
      } else if (req.body.userId) {
        userId = req.body.userId;
        console.log('Using userId from request body:', userId);
      } else {
        console.log('No userId provided in request');
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          shouldClearSession: false
        });
        return;
      }
      
      const { fullName, phone, currentPassword, newPassword } = req.body;
      
      // Get auth token from headers
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        console.log('No authorization header provided');
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
          console.log('Updating password via auth service');
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
            console.log('Password change failed from auth service');
            res.status(400).json({
              success: false,
              message: 'Password change failed - current password may be incorrect',
              passwordError: true,
              shouldClearSession: false
            });
            return;
          }
          console.log('Password updated successfully');
        } catch (error: any) {
          console.error('Password update error from auth service:', error.response?.data || error.message);
          // Use 400 status code for password errors to prevent automatic logout
          res.status(400).json({
            success: false,
            message: error.response?.data?.message || 'Password change failed - current password may be incorrect',
            passwordError: true,
            shouldClearSession: false
          });
          return;
        }
      }

      const profileImage = req.file;
      console.log('Profile image:', profileImage ? { filename: profileImage.filename, path: profileImage.path } : 'No image uploaded');
      
      // Get user from repository
      const user = await userRepository.findById(userId);
      if (!user) {
        console.log('User not found in database:', userId);
        if (profileImage) {
          fs.unlinkSync(profileImage.path);
          console.log('Deleted uploaded image due to user not found');
        }
        res.status(404).json({ 
          success: false, 
          message: 'User not found',
          shouldClearSession: true // Indicate that session should be cleared
        });
        return;
      }

      console.log('Found user:', { userId: user.userId, email: user.email });

      // Delete old profile image if exists and new one is uploaded
      if (profileImage && user.profileImage) {
        const oldImagePath = path.join(__dirname, '../../../uploads', user.profileImage);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Deleted old profile image:', oldImagePath);
          } else {
            console.log('Old profile image not found at path:', oldImagePath);
          }
        } catch (error) {
          console.error('Failed to delete old profile image:', error);
        }
      }

      // Prepare update data
      const updateData: any = {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
      };
      
      // Only add profileImage to updateData if a new image was uploaded
      if (profileImage) {
        // Ensure the directory exists
        const profileImagesDir = path.join(__dirname, '../../../uploads/profile-images');
        if (!fs.existsSync(profileImagesDir)) {
          fs.mkdirSync(profileImagesDir, { recursive: true });
          console.log('Created profile-images directory:', profileImagesDir);
        }
        
        updateData.profileImage = `profile-images/${profileImage.filename}`;
      }

      console.log('Updating user with data:', updateData);

      // Update user
      const updatedUser = await userRepository.update(userId, updateData);
      console.log('User updated successfully');

      // Create full URL for profile image
      const profileImageUrl = updatedUser.profileImage 
        ? `${API_URL}/uploads/${updatedUser.profileImage}`
        : null;

      console.log('Sending successful response with updated user data');
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...updatedUser,
          profileImage: profileImageUrl
        }
      });
    } catch (error: any) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Deleted uploaded image due to error');
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      console.error('Update profile error:', error.message, error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update profile',
        shouldClearSession: false // Don't clear session for server errors
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
          ? `${API_URL}/uploads/${user.profileImage}`
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