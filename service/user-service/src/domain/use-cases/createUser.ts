import { UserRepository } from '../repositories/userRepository';
import { User } from '../entities/user';

export class CreateUser {
  constructor(private userRepo: UserRepository) {}

  async execute(data: {
    userId: string;
    fullName: string;
    phone: string;
    email: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const existingUser = await this.userRepo.findByEmail(data.email);
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }

      const referralId = this.generateReferralId();

      const user = new User(
        data.userId,
        data.fullName,
        data.phone,
        data.email,
        [],          // addresses (default empty array)
        false,       // onlineStatus (default)
        false,       // isVerified (default)
        referralId,
        true
      );
      
      const createdUser = await this.userRepo.create(user);
      return { success: true, user: createdUser };
    } catch (error) {
      return { success: false, error: `Failed to create user: ${error}` };
    }
  }
  private generateReferralId(): string {
    const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase(); // 5-character random string
    return `REF-${randomStr}`;
  }
}