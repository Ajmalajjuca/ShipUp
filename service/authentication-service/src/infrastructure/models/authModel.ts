import mongoose from 'mongoose';
import { Auth } from '../../domain/entities/auth';

const AuthSchema = new mongoose.Schema<Auth>({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, },
  role: { type: String, enum: ['user', 'driver', 'admin'], required: true },
}, { timestamps: true });

export const AuthModel = mongoose.model<Auth>('Auth', AuthSchema);