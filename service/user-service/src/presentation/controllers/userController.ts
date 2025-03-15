import { Request, Response } from 'express';
import { CreateUser } from '../../domain/use-cases/createUser';
import { GetUser } from '../../domain/use-cases/getUser';
import { UpdateUser } from '../../domain/use-cases/updateUser';
import { DeleteUser } from '../../domain/use-cases/deleteUser';
import { UserRepositoryImpl } from '../../infrastructure/repositories/userRepositoryImpl';

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
  }
};