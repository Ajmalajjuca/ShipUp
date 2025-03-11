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
    
    const isPasswordValid = bcrypt.compare(password, user.password);
    console.log('password:',password,'user.password:',user.password);
    if (!isPasswordValid) return null;

    return user;
  }
}
