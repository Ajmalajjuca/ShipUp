import axios from 'axios';

export class UserService {
  constructor(private userServiceUrl: string = process.env.USER_SERVICE_URL || '') {}

  async createUserProfile(userData: {
    userId: string;
    email: string;
    fullName?: string;
    picture?: string;
    role: string;
  }) {

    
    try {
      const response = await axios.post(`${this.userServiceUrl}/users`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return true;
    } catch (error: any) {
      console.error('Error creating user profile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: this.userServiceUrl
      });
      throw new Error(error.response?.data?.error || 'Failed to create user profile');
    }
  }

  async getUserProfile(userId: string, token: string) {

    
    try {
      const response = await axios.get(
        `${this.userServiceUrl}/users/${userId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.user;
    } catch (error: any) {
      console.error('Error fetching user profile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        userId,
        serviceUrl: this.userServiceUrl
      });
      return null;
    }
  }
} 