import { Driver } from '../../domain/entities/driver';
import { PartnerRepository } from '../../domain/repositories/driverRepository';
import { DriverModel,  } from '../models/driverModel';

// Define PartnerDocument interface
interface PartnerDocument {
  _id: string;
  partnerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  address: string;
  vehicleType: string;
  registrationNumber: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  bankDetailsCompleted: boolean;
  personalDocumentsCompleted: boolean;
  vehicleDetailsCompleted: boolean;
  isActive: boolean;
  status: boolean;
  totalOrders?: number;
  ongoingOrders?: number;
  canceledOrders?: number;
  completedOrders?: number;
  profilePicturePath?: string;
  aadharPath?: string;
  panPath?: string;
  licensePath?: string;
  insuranceDocPath?: string;
  pollutionDocPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PartnerRepositoryImpl implements PartnerRepository {
  async create(driver: Driver): Promise<Driver> {
    const newDriver = new DriverModel(driver);
    const savedDriver = await newDriver.save();
    return savedDriver.toObject();
  }

  async findById(partnerId: string): Promise<Driver | null> {
    const driver = await DriverModel.findOne({ partnerId }).lean();
    return driver;
  }

  async findByEmail(email: string): Promise<Driver | null> {
    const driver = await DriverModel.findOne({ email }).lean();
    return driver;
  }

  async update(partnerId: string, data: Partial<Driver>): Promise<Driver | null> {
    const updatedDriver = await DriverModel.findOneAndUpdate(
      { partnerId },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    );
    return updatedDriver;
  }

  async delete(partnerId: string): Promise<boolean> {
    const result = await DriverModel.deleteOne({ partnerId });
    return result.deletedCount === 1;
  }

  async findAll(): Promise<Driver[]> {
    try {
      const drivers = await DriverModel.find().lean();
      
      return drivers;
    } catch (error) {
      throw new Error(`Failed to find drivers: ${error}`);
    }
  }

  async findByIdAndUpdate(partnerId: string, updateData: Partial<PartnerDocument>) {
    try {
      
      const updatedPartner = await DriverModel.findOneAndUpdate(
        { partnerId: partnerId },
        { $set: updateData },
        { new: true }
      );
      

      if (!updatedPartner) {
        return null;
      }

      const partnerData = updatedPartner.toObject();

      return {
        ...partnerData,
        profilePicturePath: partnerData.profilePicturePath 
          ? `${process.env.API_URL}/uploads/${partnerData.profilePicturePath}`
          : null,
        aadharPath: partnerData.aadharPath 
          ? `${process.env.API_URL}/uploads/documents/aadhar/${partnerData.aadharPath}`
          : null,
        panPath: partnerData.panPath 
          ? `${process.env.API_URL}/uploads/documents/pan/${partnerData.panPath}`
          : null,
        licensePath: partnerData.licensePath 
          ? `${process.env.API_URL}/uploads/documents/license/${partnerData.licensePath}`
          : null,
        insuranceDocPath: partnerData.insuranceDocPath 
          ? `${process.env.API_URL}/uploads/documents/insurance/${partnerData.insuranceDocPath}`
          : null,
        pollutionDocPath: partnerData.pollutionDocPath 
          ? `${process.env.API_URL}/uploads/documents/pollution/${partnerData.pollutionDocPath}`
          : null,
      };
    } catch (error) {
      console.error('Error in findByIdAndUpdate:', error);
      throw error;
    }
  }
}