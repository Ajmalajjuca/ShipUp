// infrastructure/repositories/authRepositoryImpl.ts
import { AuthRepository } from '../../domain/repositories/authRepository';
import { AuthModel } from '../models/authModel';

export class AuthRepositoryImpl implements AuthRepository {
  async findByEmail(email: string): Promise<any> {
    return await AuthModel.findOne({ email }).exec();
  }

  async create(authData: { userId: string; email: string; role: string; password?: string }): Promise<any> {
    const newUser = new AuthModel(authData);
    return await newUser.save();
  }

  async delete(userId: string): Promise<void> {
    await AuthModel.deleteOne({ userId }).exec();
  }

}