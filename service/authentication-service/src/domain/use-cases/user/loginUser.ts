import bcrypt from 'bcrypt';
import { UserRepository } from '../../repositories/userRepository';

export class LoginUser {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return null;
    console.log('Stored Hash:', user.password);
    console.log('Password Match:', await bcrypt.compare(password, user.password));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('user:---', isPasswordValid);
    if (!isPasswordValid) return null;

    return user;
  }
}
