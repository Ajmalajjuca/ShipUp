import mongoose from 'mongoose';
import { User } from '../../domain/entities/user';

const userSchema = new mongoose.Schema<User>({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  fullName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  profileImage: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const UserModel = mongoose.model<User>('User', userSchema);