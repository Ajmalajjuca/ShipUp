import { Driver } from '../entities/driver';
import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  name: String,
  license: String,
  status: String,
});

const DriverModel = mongoose.model('Driver', DriverSchema);

export class DriverRepository {
  async save(driver: Driver): Promise<Driver> {
    const newDriver = new DriverModel(driver);
    await newDriver.save();
    return driver;
  }

  async findAll(): Promise<Driver[]> {
    return await DriverModel.find();
  }

  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    await DriverModel.updateOne({ _id: id }, { status });
  }
}