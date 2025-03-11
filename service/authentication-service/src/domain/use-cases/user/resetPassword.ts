import { UserRepository } from '../../repositories/userRepository';
import bcrypt from 'bcrypt';

class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export class ResetPassword {
  private static readonly SALT_ROUNDS = 10;

  constructor(private userRepository: UserRepository) {}

  async execute(email: string, newPassword: string): Promise<void> {
    if (!this.isValidPassword(newPassword)) {
      console.error(`Weak password attempt for email: ${email}`);
      throw new Error('Password does not meet security requirements');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      console.error(`User not found: ${email}`);
      throw new UserNotFoundError();
    }

    const hashedPassword = await bcrypt.hash(newPassword, ResetPassword.SALT_ROUNDS);
    await this.userRepository.update(email, { password: hashedPassword });

    console.log(`Password successfully reset for user: ${email}`);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 8; // Add more security checks as needed (e.g., regex for complexity)
  }
}
