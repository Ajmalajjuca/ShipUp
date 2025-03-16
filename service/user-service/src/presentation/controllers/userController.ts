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

export const userController = {
  async create(req: Request, res: Response) {
    try {
      const { userId, fullName, phone, email } = req.body;

      if (!userId || !fullName || !phone || !email) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, fullName, phone, and email are required'
        });
        return
      }

      const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        res.status(400).json({ success: false, error: 'Invalid phone number format' });
        return
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
      if (!userId) {
        res.status(400).json({ success: false, error: 'User ID is required' });
        return
      }

      const result = await getUser.execute(userId);
      res.status(result.success ? 200 : 404).json(result);
      return
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return
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
      const userId = req.user.userId;
      const { fullName, phone, currentPassword, newPassword } = req.body;
      const profileImage = req.file;

      
      
      

      // Get user from repository
      const user = await userRepository.findById(userId);
      if (!user) {
        // Delete uploaded file if user not found
        if (profileImage) {
          fs.unlinkSync(profileImage.path);
        }
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // If changing password, verify with auth service
      if (currentPassword && newPassword) {
        const isValidPassword = await authService.verifyPassword(userId, currentPassword);        
        
        if (!isValidPassword) {
          // Delete uploaded file if password verification fails
          if (profileImage) {
            fs.unlinkSync(profileImage.path);
          }
          res.status(401).json({ success: false, message: 'Current password is incorrect' });
          return;
        }

        // Send password update request to auth service
        try {          
          await axios.put(`${process.env.AUTH_SERVICE_URL}auth/update-password`, {
            userId,
            newPassword
          }, {
            headers: {
              Authorization: req.headers.authorization
            }
          });
          
        } catch (error) {
          // Delete uploaded file if password update fails
          if (profileImage) {
            fs.unlinkSync(profileImage.path);
          }
          res.status(500).json({ success: false, message: 'Failed to update password' });
          return;
        }
      }

      // Delete old profile image if exists and new one is uploaded
      if (profileImage && user.profileImage) {
        try {
          fs.unlinkSync(user.profileImage);
        } catch (error) {
          console.error('Failed to delete old profile image:', error);
        }
      }

      // Prepare update data (without password)
      const updateData: any = {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(profileImage && { 
          profileImage: `profile-images/${profileImage.filename}` // Store relative path
        })
      };

      // Update user
      const updatedUser = await userRepository.update(userId, updateData);

      // Create full URL for profile image
      const profileImageUrl = updatedUser.profileImage 
        ? `${process.env.API_URL || 'http://localhost:3002'}/uploads/profile-images/${path.basename(updatedUser.profileImage)}`
        : null;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          userId: updatedUser.userId,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          profileImage: profileImageUrl
        }
      });
    } catch (error) {
      // Delete uploaded file if update fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
};