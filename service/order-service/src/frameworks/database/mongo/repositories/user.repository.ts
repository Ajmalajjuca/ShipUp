import axios from 'axios';
import { User } from '../../../../domain/entities/user';
import { UserRepository } from '../../../../domain/repositories/user.repository';


export class HttpUserRepository implements UserRepository {
  private API_URL: string;

  constructor() {
    this.API_URL = process.env.API_URL || 'http://localhost:3000/api';
  }

  async findById(id: string): Promise<User | null> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}`);
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

  async updateWalletBalance(userId: string, amount: number, token: string): Promise<User> {
    console.log('baseurl===>',this.API_URL);
    try {
      const response = await axios.patch(
        `${this.API_URL}/users/${userId}/wallet`,
        { amount },
        {
        headers: {
          Authorization: `Bearer ${token}`, // Include the JWT token
        },
      }
      );
      console.log('wallte response===>',response);
      
      
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