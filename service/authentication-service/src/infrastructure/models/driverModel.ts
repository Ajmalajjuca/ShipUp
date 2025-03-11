import mongoose, { Schema } from 'mongoose';
import { Driver } from '../../domain/entities/driver';

const DriverSchema = new Schema<Driver>(
  {
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    dateOfBirth: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
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
  },
  {
    timestamps: true,
  }
);

export const DriverModel = mongoose.model<Driver>('Driver', DriverSchema);