import { UserRepository } from '../../domain/repositories/userRepository';
import { User } from '../../domain/entities/user';
import { UserModel } from '../models/userModel';
import bcrypt from 'bcrypt';

export class UserRepositoryImpl implements UserRepository {
  async create(user: Omit<User, 'id'>): Promise<User> {
    if (!user.password) {
      throw new Error('Password is required'); // Prevents undefined passwords
    }

    const newUser = await UserModel.create({ ...user, });

    return this.mapToUser(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email }).lean().exec();
    return userDoc ? this.mapToUser(userDoc) : null;
  }

  async update(email: string, data: Partial<User>): Promise<User | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await UserModel.findOneAndUpdate({ email }, data, { new: true }).lean().exec();
    return updatedUser ? this.mapToUser(updatedUser) : null;
  }

  async deleteByEmail(email: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ email }).exec();
    return result.deletedCount > 0;
  }

  private mapToUser(userDoc: any): User {
    return {
      id: userDoc._id.toString(),
      fullName: userDoc.fullName,
      phone: userDoc.phone,
      email: userDoc.email,
      password: userDoc.password,
      isVerified: userDoc.isVerified,
      role: userDoc.role,
      addresses: userDoc.addresses,
      onlineStatus: userDoc.onlineStatus,
      referralId: userDoc.referralId,
      profilePic: userDoc.profilePic,
    };
  }
}
