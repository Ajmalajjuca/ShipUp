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

      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Create a map of file paths
      const fileMap: { [key: string]: string } = {};
      if (files) {
        Object.keys(files).forEach(fieldname => {
          if (files[fieldname] && files[fieldname][0]) {
            // Store relative path from uploads directory
            const relativePath = files[fieldname][0].path.split('uploads/')[1];
            fileMap[fieldname] = relativePath;
          }
        });
      }

      const requiredFields = [
        'fullName', 'mobileNumber', 'dateOfBirth', 'address', 'email',
        'vehicleType', 'registrationNumber', 'accountHolderName', 'accountNumber',
        'ifscCode', 'upiId'
      ];

      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
         res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
        return
      }

      const partnerId = `DRV-${uuidv4()}`;

      try {
        const authResponse = await axios.post('http://localhost:3001/auth/register-driver', {
          email,
          role: 'driver',
          partnerId,
        });

        if (!authResponse.data.success) {
           res.status(400).json({
            success: false,
            error: authResponse.data.error || 'Authentication registration failed'
          });
          return
        }

        // Create the driver with file paths
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
          // Rollback auth service registration if driver creation fails
          await axios.delete(`http://localhost:3001/auth/delete/${partnerId}`);
           res.status(400).json({
            success: false,
            error: result.error || 'Failed to create driver'
          });
          return
        }

         res.status(201).json({
          success: true,
          status: 'success',
          message: 'Driver registered successfully.',
          driver: { email, partnerId }
        });
        return

      } catch (error) {
        console.error('Auth service error:', error);
         res.status(500).json({ 
          success: false, 
          error: 'Failed to register with authentication service' 
        });
        return
      }

    } catch (error) {
      console.error('Create driver error:', error);
       res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
      return
    }
  },
  async verifyDoc(req: Request, res: Response) {
    try {
      const { email } = req.query;
      console.log('email::',email);
      

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
  async getAll(req: Request, res: Response) {
    try {
      const drivers = await partnerRepository.findAll();
      
      // Transform driver data to include status for verified partners
      const driversWithUrls = drivers.map(driver => ({
        partnerId: driver.partnerId,
        fullName: driver.fullName,
        email: driver.email,
        phone: driver.mobileNumber,
        profileImage: driver.profilePicturePath 
          ? `${process.env.API_URL}/uploads/${driver.profilePicturePath}`
          : null,
        createdAt: driver.createdAt,
        totalOrders: driver.totalOrders || 0,
        ongoing: driver.ongoingOrders || 0,
        canceled: driver.canceledOrders || 0,
        completed: driver.completedOrders || 0,
        status: driver.isActive || false,  // Keep this for PartnerList
        bankDetailsCompleted: driver.bankDetailsCompleted || false,
        personalDocumentsCompleted: driver.personalDocumentsCompleted || false,
        vehicleDetailsCompleted: driver.vehicleDetailsCompleted || false
      }));

      res.status(200).json({
        success: true,
        partners: driversWithUrls
      });
    } catch (error) {
      console.error('Get all drivers error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
  async updateStatus(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const { status } = req.body;

      if (typeof status !== 'boolean') {
        res.status(400).json({ success: false, error: 'Status must be a boolean' });
        return;
      }

      const updatedDriver = await partnerRepository.update(partnerId, {
        isActive: status
      });

      if (!updatedDriver) {
        res.status(404).json({ success: false, error: 'Driver not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Driver status updated successfully',
        partner: updatedDriver
      });
    } catch (error) {
      console.error('Update driver status error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
  async delete(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const deleted = await partnerRepository.delete(partnerId);

      if (!deleted) {
        res.status(404).json({ success: false, error: 'Driver not found' });
        return;
      }

      // Also delete from auth service
      try {
        await axios.delete(`${process.env.AUTH_SERVICE_URL}/auth/delete/${partnerId}`);
      } catch (error) {
        console.error('Failed to delete from auth service:', error);
      }

      res.status(200).json({
        success: true,
        message: 'Driver deleted successfully'
      });
    } catch (error) {
      console.error('Delete driver error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
  async getById(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const driver = await partnerRepository.findById(partnerId);

      if (!driver) {
        res.status(404).json({ success: false, error: 'Partner not found' });
        return;
      }

      // Transform paths to full URLs
      const partnerWithUrls = {
        ...driver,
        profilePicturePath: driver.profilePicturePath 
          ? `${process.env.API_URL}/uploads/${driver.profilePicturePath}`
          : null,
        // Add other document paths similarly
      };

      res.status(200).json({
        success: true,
        partner: partnerWithUrls
      });
    } catch (error) {
      console.error('Get partner error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
  async updateVerificationStatus(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const { bankDetailsCompleted, personalDocumentsCompleted, vehicleDetailsCompleted } = req.body;

      // Only send the fields that need to be updated
      const updateData = {
        ...(bankDetailsCompleted !== undefined && { bankDetailsCompleted }),
        ...(personalDocumentsCompleted !== undefined && { personalDocumentsCompleted }),
        ...(vehicleDetailsCompleted !== undefined && { vehicleDetailsCompleted })
      };

      const updatedPartner = await partnerRepository.findByIdAndUpdate(partnerId, updateData);

      if (!updatedPartner) {
        res.status(404).json({ success: false, error: 'Partner not found' });
        return;
      }

      res.status(200).json({
        success: true,
        partner: updatedPartner
      });
    } catch (error) {
      console.error('Update verification status error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};