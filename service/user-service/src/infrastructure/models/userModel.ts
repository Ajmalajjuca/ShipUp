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
  },
  addresses: {
    type: [String],
    default: []
  },
  onlineStatus: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true  // Users are active by default
  },
  referralId: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values to not count towards uniqueness
  },
  profileImage: { 
    type: String,
    default: null
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

userSchema.pre('save', function(next) {
  if (!this.referralId) {
    // Generate a unique referral ID based on userId or other logic
    this.referralId = `REF${this.userId.slice(-6).toUpperCase()}`;
  }
  next();
});

export const UserModel = mongoose.model<User>('User', userSchema);