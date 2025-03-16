import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  generateToken(userId: string, email: string, role: string): string {
    const payload = { userId, email, role };
    const expiresIn: SignOptions['expiresIn'] = isNaN(Number(this.jwtExpiresIn)) ? this.jwtExpiresIn as SignOptions['expiresIn'] : Number(this.jwtExpiresIn);
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, this.jwtSecret, options);
  }

  generateUserId(): string {
    return uuidv4();
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}