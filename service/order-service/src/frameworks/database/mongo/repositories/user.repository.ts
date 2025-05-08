import axios from 'axios';
import { User } from '../../../../domain/entities/user';
import { UserRepository } from '../../../../domain/repositories/user.repository';


export class HttpUserRepository implements UserRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  }

  async findById(id: string): Promise<User | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      console.info(`User found: ${id}`);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`User not found: ${id}`);
        return null;
      }
      if (axios.isAxiosError(error)) {
        console.error('Error finding user:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw new Error('Failed to find user');
    }
  }

  async updateWalletBalance(userId: string, amount: number): Promise<User> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/${userId}/wallet`,
        { amount }
      );
      console.info(`Wallet balance updated for user: ${userId}, new balance: ${response.data.user.walletBalance}`);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error updating wallet balance:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw new Error('Failed to update wallet balance');
    }
  }

}