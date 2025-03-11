import { Driver } from '../../entities/driver';
import { DriverRepository } from '../../repositories/driverRepository';
import { FileStorageService } from '../../../application/services/fileStorageService';

export interface RegisterDriverDTO {
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
    aadhar: Express.Multer.File;
    pan: Express.Multer.File;
    license: Express.Multer.File;
    insuranceDoc: Express.Multer.File;
    pollutionDoc: Express.Multer.File;
    profilePicture: Express.Multer.File;
    PersonalDocuments: boolean
    VehicleDetails: boolean
    BankDetails: boolean
}

export class RegisterDriverUseCase {
    constructor(
        private driverRepository: DriverRepository,
        private fileStorageService: FileStorageService
    ) { }

    async execute(registerDriverDTO: RegisterDriverDTO): Promise<{ driver?: Driver; success: boolean; error?: string }> {

        const existingDriver = await this.driverRepository.findByMobileNumber(registerDriverDTO.mobileNumber);
        if (existingDriver) {
            return { success: false, error: 'A user with this email already exists' };
        }

        // Upload files to storage and get paths
        const aadharPath = await this.fileStorageService.uploadFile('drivers/documents/aadhar', registerDriverDTO.aadhar);
        const panPath = await this.fileStorageService.uploadFile('drivers/documents/pan', registerDriverDTO.pan);
        const licensePath = await this.fileStorageService.uploadFile('drivers/documents/license', registerDriverDTO.license);
        const insuranceDocPath = await this.fileStorageService.uploadFile('drivers/documents/insurance', registerDriverDTO.insuranceDoc);
        const pollutionDocPath = await this.fileStorageService.uploadFile('drivers/documents/pollution', registerDriverDTO.pollutionDoc);
        const profilePicturePath = await this.fileStorageService.uploadFile('drivers/profile', registerDriverDTO.profilePicture);

        // Create driver entity
        const driver: Driver = {
            fullName: registerDriverDTO.fullName,
            mobileNumber: registerDriverDTO.mobileNumber,
            dateOfBirth: registerDriverDTO.dateOfBirth,
            address: registerDriverDTO.address,
            email: registerDriverDTO.email,
            vehicleType: registerDriverDTO.vehicleType,
            registrationNumber: registerDriverDTO.registrationNumber,
            accountHolderName: registerDriverDTO.accountHolderName,
            accountNumber: registerDriverDTO.accountNumber,
            ifscCode: registerDriverDTO.ifscCode,
            upiId: registerDriverDTO.upiId,
            aadharPath,
            panPath,
            licensePath,
            insuranceDocPath,
            pollutionDocPath,
            profilePicturePath,
            PersonalDocuments:registerDriverDTO.PersonalDocuments,
            VehicleDetails:registerDriverDTO.VehicleDetails,
            BankDetails:registerDriverDTO.BankDetails,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save driver to repository
        const savedDriver = await this.driverRepository.create(driver);
        return { success: true, driver: savedDriver };
    }
}