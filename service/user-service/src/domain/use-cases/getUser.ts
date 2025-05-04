import { UserRepository } from '../repositories/userRepository';
import { User } from '../entities/user';

export class GetUser {
  constructor(private userRepo: UserRepository) {}

  async execute(userId: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      return { success: true, user };
    } catch (error) {
      return { success: false, error: `Failed to get user: ${error}` };
    }
  }
}