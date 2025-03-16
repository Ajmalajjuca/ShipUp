// presentation/controllers/partnerController.ts
import { Request, Response } from 'express';
import { CreateDriver } from '../../domain/use-cases/createDriver';
import { PartnerRepositoryImpl } from '../../infrastructure/repositories/driverRepositoryImpl';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const partnerRepository = new PartnerRepositoryImpl();
const createDriver = new CreateDriver(partnerRepository);

export const partnerController = {
  async create(req: Request, res: Response) {
    try {
      const {
        fullName,
        mobileNumber,
        dateOfBirth,
        address,
        email,
        vehicleType,
        registrationNumber,
        accountHolderName,
        accountNumber,
        ifscCode,
        upiId,
      } = req.body;
      
      
      const files = req.files as Express.Multer.File[] || [];
      const fileMap = files.reduce((acc, file) => {
        acc[file.fieldname] = file.path;
        return acc;
      }, {} as Record<string, string>);
      
      const requiredFields = [
        'fullName', 'mobileNumber', 'dateOfBirth', 'address', 'email',
        'vehicleType', 'registrationNumber', 'accountHolderName', 'accountNumber',
        'ifscCode', 'upiId', 'aadhar', 'pan', 'license', 'insuranceDoc', 'pollutionDoc', 'profilePicture'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !req.body[field] && !fileMap[field]
      );
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }
      
      const partnerId = `DRV-${uuidv4()}`;
      
      const authResponse = await axios.post('http://localhost:3001/auth/register-driver', {
        email,
        role: 'driver',
        partnerId, // Include partnerId for consistency
      }, {
        headers: { 'Content-Type': 'application/json' } // No files, so JSON is fine
      });
      
      if (!authResponse.data.success) {
        res.status(400).json({
          success: false,
          error: authResponse.data.error || 'Authentication registration failed'
        });
        return;
      }

      // Directly create the driver in the Partner Service database
      const result = await createDriver.execute({
        partnerId,
        fullName,
        mobileNumber,
        dateOfBirth,
        address,
        email,
        vehicleType,
        registrationNumber,
        accountHolderName,
        accountNumber,
        ifscCode,
        upiId,
        aadharPath: fileMap['aadhar'],
        panPath: fileMap['pan'],
        licensePath: fileMap['license'],
        insuranceDocPath: fileMap['insuranceDoc'],
        pollutionDocPath: fileMap['pollutionDoc'],
        profilePicturePath: fileMap['profilePicture'],
      });

      if (!result.success) {
        // Optionally rollback Authentication Service entry if Partner Service fails
        await axios.delete(`http://localhost:3001/auth/delete/${partnerId}`);
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to create driver'
        });
        return;
      }

      res.status(201).json({
        success: true,
        status: 'success',
        message: 'Driver registered successfully.',
        driver: { email, partnerId }
      });
      return;
    } catch (error) {
      console.error('Create driver errorr:');
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },
  async verifyDoc(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Email query parameter is required'
        });
        return;
      }

      // Fetch driver by email from Partner Service database
      const driver = await partnerRepository.findByEmail(email);
      if (!driver) {
        res.status(404).json({
          success: false,
          error: 'Driver not found'
        });
        return;
      }

      // Define verification status based on document presence
      // For simplicity, assume documents are verified if paths exist
      // Adjust logic based on your actual verification process
      const verificationData = {
        BankDetails: driver.bankDetailsCompleted,
        PersonalDocuments: driver.personalDocumentsCompleted,
        VehicleDetails: driver.vehicleDetailsCompleted
      };

      console.log('verificationData::',verificationData);
      

      res.status(200).json({
        success: true,
        data: verificationData
      });
      return;
    } catch (error) {
      console.error('Verify document error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }
  },
};