import mongoose from 'mongoose';
import { Driver } from '../../domain/entities/driver';

const DriverSchema = new mongoose.Schema<Driver>({
  partnerId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  vehicleType: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  upiId: { type: String, required: true },
  aadharPath: { type: String, required: true },
  panPath: { type: String, required: true },
  licensePath: { type: String, required: true },
  insuranceDocPath: { type: String, required: true },
  pollutionDocPath: { type: String, required: true },
  profilePicturePath: { type: String, required: true },
  bankDetailsCompleted: { type: Boolean, default: false },
  vehicleDetailsCompleted: { type: Boolean, default: false },
  personalDocumentsCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const DriverModel = mongoose.model<Driver>('Driver', DriverSchema);