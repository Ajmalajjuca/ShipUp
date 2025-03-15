import mongoose from 'mongoose';
import { User } from '../../domain/entities/user';

const UserSchema = new mongoose.Schema<User>({
  userId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  addresses: [{ type: String }],
  profilePic: { type: String },
  onlineStatus: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  referralId: { type: String, unique: true }
}, { timestamps: true });

export const UserModel = mongoose.model<User>('User', UserSchema);