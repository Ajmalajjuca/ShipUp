// src/domain/use-cases/registerUser.ts
import { User } from '../../entities/user';
import { UserRepository } from '../../repositories/userRepository';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class RegisterUser {
  constructor(private userRepo: UserRepository) {}

  async execute(fullName: string, phone: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      return { success: false, error: 'A user with this email already exists' };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const referralId = `RF-${uuidv4().slice(0, 6).toUpperCase()}`;

    const user = new User(
      Date.now().toString(), // Temporary ID (will be replaced by DB-generated ID later)
      fullName,
      phone,
      email,
      hashedPassword,
      referralId
    );

    return { success: true, user };
  }
}