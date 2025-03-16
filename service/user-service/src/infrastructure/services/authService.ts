import axios from 'axios';

export class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  async verifyPassword(userId: string, currentPassword: string): Promise<boolean> {
    
    try {
      const response = await axios.post(`${this.baseUrl}auth/verify-password`, {
        userId,
        password: currentPassword
      });
      
      const data = response.data as { success: boolean };
      
      return data.success;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }
}

export const authService = new AuthService(); 