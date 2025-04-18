import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repositories/userRepository';
import { UserModel } from '../models/userModel';

export class UserRepositoryImpl implements UserRepository {
  async create(user: User): Promise<User> {
    try {
      const newUser = new UserModel(user);
      const savedUser = await newUser.save();
      return savedUser.toObject();
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ userId }).lean();
      return user;
    } catch (error) {
      throw new Error(`Failed to find user: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email }).lean();
      return user;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error}`);
    }
  }

  async update(userId: string, data: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { userId },
        { 
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { new: true, lean: true }
      );

      if (!updatedUser) {
        return null;
      }

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  async delete(userId: string): Promise<boolean> {
    try {
      const result = await UserModel.deleteOne({ userId });
      return result.deletedCount === 1;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await UserModel.find().lean();
      return users;
    } catch (error) {
      throw new Error(`Failed to find users: ${error}`);
    }
  }

  async findByIdAndUpdate(userId: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true }
      ).lean();

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async updateStatus(userId: string, status: boolean): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { userId },
        { 
          $set: {
            status,
            updatedAt: new Date()
          }
        },
        { new: true, lean: true }
      );

      return updatedUser;
    } catch (error) {
      console.error('Error updating user status:', error);
      return null;
    }
  }

  async updateProfileImage(userId: string, profileImage: string): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { userId },
        { 
          $set: {
            profileImage,
            updatedAt: new Date()
          }
        },
        { new: true, lean: true }
      );

      return updatedUser;
    } catch (error) {
      console.error('Error updating profile image:', error);
      return null;
    }
  }
}