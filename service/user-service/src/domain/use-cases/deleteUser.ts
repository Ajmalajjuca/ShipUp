import { UserRepository } from '../repositories/userRepository';

export class DeleteUser {
  constructor(private userRepo: UserRepository) {}

  async execute(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const deleted = await this.userRepo.delete(userId);
      return { success: deleted, error: deleted ? undefined : 'Failed to delete user' };
    } catch (error) {
      return { success: false, error: `Failed to delete user: ${error}` };
    }
  }
}