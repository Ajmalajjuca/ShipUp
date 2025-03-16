// domain/use-cases/createDriver.ts
import { PartnerRepository } from '../repositories/driverRepository';
import { Driver } from '../entities/driver';

export class CreateDriver {
  constructor(private partnerRepo: PartnerRepository) {}

  async execute(data: {
    partnerId: string;
    fullName: string;
    mobileNumber: string;
    dateOfBirth: string;
    address: string;
    email: string;
    vehicleType: string;
    registrationNumber: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    aadharPath: string;
    panPath: string;
    licensePath: string;
    insuranceDocPath: string;
    pollutionDocPath: string;
    profilePicturePath: string;
  }): Promise<{ success: boolean; driver?: Driver; error?: string }> {
    try {
      const existingDriver = await this.partnerRepo.findByEmail(data.email);
      if (existingDriver) {
        return { success: false, error: 'Email already exists' };
      }

      const driver = new Driver(
        data.partnerId,
        data.fullName,
        data.mobileNumber,
        data.dateOfBirth,
        data.address,
        data.email,
        data.vehicleType,
        data.registrationNumber,
        data.accountHolderName,
        data.accountNumber,
        data.ifscCode,
        data.upiId,
        data.aadharPath,
        data.panPath,
        data.licensePath,
        data.insuranceDocPath,
        data.pollutionDocPath,
        data.profilePicturePath
      );

      const createdDriver = await this.partnerRepo.create(driver);
      return { success: true, driver: createdDriver };
    } catch (error) {
      console.error('Create driver errorrr:', error);
      return { success: false, error: 'Failed to create driver' };
    }
  }
}