import mongoose from 'mongoose';
import { Auth } from '../../domain/entities/auth';

const authSchema = new mongoose.Schema<Auth>({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

authSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const AuthModel = mongoose.model<Auth>('Auth', authSchema);