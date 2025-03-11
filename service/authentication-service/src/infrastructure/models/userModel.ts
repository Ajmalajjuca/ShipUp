import mongoose from 'mongoose';

// Define User Schema
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,

  },
  password: { type: String, required: true, minlength: 8 },
  addresses: [{ type: String }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePic: { type: String },
  onlineStatus: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  referralId: { type: String, unique: true }
}, { timestamps: true });

// Create User Model
export const UserModel = mongoose.model('User', UserSchema);
