import { Driver } from '../../domain/entities/driver';
import { PartnerRepository } from '../../domain/repositories/driverRepository';
import { DriverModel } from '../models/driverModel';

export class PartnerRepositoryImpl implements PartnerRepository {
  async create(driver: Driver): Promise<Driver> {
    const newDriver = new DriverModel(driver);
    const savedDriver = await newDriver.save();
    return savedDriver.toObject() as Driver;
  }

  async findById(partnerId: string): Promise<Driver | null> {
    const driver = await DriverModel.findOne({ partnerId }).lean();
    return driver as Driver | null;
  }

  async findByEmail(email: string): Promise<Driver | null> {
    const driver = await DriverModel.findOne({ email }).lean();
    return driver as Driver | null;
  }

  async update(partnerId: string, data: Partial<Driver>): Promise<Driver | null> {
    const updatedDriver = await DriverModel.findOneAndUpdate(
      { partnerId },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    );
    return updatedDriver as Driver | null;
  }

  async delete(partnerId: string): Promise<boolean> {
    const result = await DriverModel.deleteOne({ partnerId });
    return result.deletedCount === 1;
  }
}