import { Driver } from '../../domain/entities/driver';
import { DriverRepository } from '../../domain/repositories/driverRepository';
import { Model } from 'mongoose';
import { DriverModel } from '../models/driverModel';

export class DriverRepositoryImpl implements DriverRepository {
  constructor(private driverModel: Model<Driver> = DriverModel) {}

  async create(driver: Driver): Promise<Driver> {
    const newDriver = new this.driverModel(driver);
    await newDriver.save();
    return newDriver.toObject();
  }

  async findById(id: string): Promise<Driver | null> {
    const driver = await this.driverModel.findById(id);
    return driver ? driver.toObject() : null;
  }

  async findByMobileNumber(mobileNumber: string): Promise<Driver | null> {
    const driver = await this.driverModel.findOne({ mobileNumber });
    return driver ? driver.toObject() : null;
  }





  
  async findByEmail(email: string): Promise<Driver | null> {
    try {
      const driver = await DriverModel.findOne({ email });
      return driver ? driver.toObject() : null;
    } catch (error) {
      console.error('Error finding driver by email:', error);
      return null;
    }
  }
  
  async updateOtp(email: string, otp: string, otpExpiry: Date): Promise<boolean> {
    try {
      const result = await DriverModel.updateOne(
        { email },
        { 
          $set: { 
            otp,
            otpExpiry,
            updatedAt: new Date()
          } 
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating driver OTP:', error);
      return false;
    }
  }
  
  async verifyOtp(email: string, providedOtp: string): Promise<Driver | null> {
    try {
      const driver = await DriverModel.findOne({ email });
      
      if (!driver) {
        return null;
      }
      
      // const isValid = this.otpService.verifyOtp(
      //   driver.otp,
      //   providedOtp,
      //   driver.otpExpiry
      // );
      
      // if (!isValid) {
      //   return null;
      // }
      
      // Clear OTP after successful verification
      await DriverModel.updateOne(
        { email },
        { 
          $set: { 
            otp: null,
            otpExpiry: null,
            updatedAt: new Date()
          } 
        }
      );
      
      return driver.toObject();
    } catch (error) {
      console.error('Error verifying driver OTP:', error);
      return null;
    }
  }
}