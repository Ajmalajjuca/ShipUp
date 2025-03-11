import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect('mongodb://localhost:27017/partner-service');
  console.log('MongoDB connected');
};