import { AuthRepository } from '../repositories/authRepository';
import { AuthService } from '../../application/services/authService';
import bcrypt from 'bcrypt';
import axios from 'axios';

export class LoginUser {
  constructor(
    private authRepo: AuthRepository,
    private authService: AuthService
  ) {}

  async execute(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string,userinfo?:{},authUser?:{} }> {
    const authUser = await this.authRepo.findByEmail(email);
    
    if (!authUser || !authUser.password || !(await bcrypt.compare(password, authUser.password))) {
      return { success: false, error: 'Invalid credentials' };
    }
    

    const token = this.authService.generateToken(authUser.userId, authUser.email, authUser.role);
    let userinfo;
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL;
        if (!userServiceUrl) {
          throw new Error('USER_SERVICE_URL not configured');
        }

        const response = await axios.get(`${userServiceUrl}/users/${authUser.userId}`);
        userinfo = response.data.user; // Adjust based on your User Service response structure
      } catch (error) {
        console.error('Failed to fetch user data from User Service:', error);
      }
    return { success: true,authUser,userinfo, token };
  }
}