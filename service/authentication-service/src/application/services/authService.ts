import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/user';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h'; // Configurable expiry time
  }

  generateToken(user: User): string {
    const payload = { id: user.id, email: user.email, role: user.role }; // Add role if applicable
    return jwt.sign(payload, 'your_secret_key_here', { expiresIn: '1h' });
  }
}
