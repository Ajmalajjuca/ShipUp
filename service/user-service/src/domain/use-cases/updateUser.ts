import { UserRepository } from '../repositories/userRepository';
import { User } from '../entities/user';

export class UpdateUser {
  constructor(private userRepo: UserRepository) {}

  async execute(
    userId: string,
    data: Partial<Omit<User, 'userId' | 'createdAt'>>
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (data.phone) {
        const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
        if (!phoneRegex.test(data.phone)) {
          return { success: false, error: 'Invalid phone number format' };
        }
      }

      const updatedUser = await this.userRepo.update(userId, data);
      if (!updatedUser) {
        return { success: false, error: 'Failed to update user' };
      }
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: `Failed to update user: ${error}` };
    }
  }
}