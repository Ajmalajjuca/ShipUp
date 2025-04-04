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
            // Store just the filename, not the full path
            const filename = files[fieldname][0].filename;
            
            // Map the field names to the database field names
            if (fieldname === 'aadhar') fileMap['aadharPath'] = filename;
            else if (fieldname === 'pan') fileMap['panPath'] = filename;
            else if (fieldname === 'license') fileMap['licensePath'] = filename;
            else if (fieldname === 'insuranceDoc') fileMap['insuranceDocPath'] = filename;
            else if (fieldname === 'pollutionDoc') fileMap['pollutionDocPath'] = filename;
            else if (fieldname === 'profilePicture') fileMap['profilePicturePath'] = filename;
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
          // Use the mapped field names
          ...fileMap
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
        res.status(400).json({
          success: false,
          error: 'Status must be a boolean value'
        });
        return;
      }

      const updatedPartner = await partnerRepository.findByIdAndUpdate(
        partnerId,
        { status }
      );

      if (!updatedPartner) {
        res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Partner status updated successfully',
        partner: updatedPartner
      });
    } catch (error) {
      console.error('Update partner status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
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
          ? driver.profilePicturePath
          : null,
        aadharPath: driver.aadharPath 
          ? driver.aadharPath
          : null,
        panPath: driver.panPath 
          ? driver.panPath
          : null,
        licensePath: driver.licensePath 
          ? driver.licensePath
          : null,
        insuranceDocPath: driver.insuranceDocPath 
          ? driver.insuranceDocPath
          : null,
        pollutionDocPath: driver.pollutionDocPath 
          ? driver.pollutionDocPath
          : null,
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
  },
  async update(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const { fullName, email, phone } = req.body;

      // Validate required fields
      if (!fullName && !email && !phone) {
        res.status(400).json({
          success: false,
          error: 'At least one field (fullName, email, or phone) is required for update'
        });
        return;
      }

      // Create update object with only provided fields
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      if (phone) updateData.mobileNumber = phone; // Note: in DB it's mobileNumber

      // Update partner
      const updatedPartner = await partnerRepository.findByIdAndUpdate(partnerId, updateData);
      console.log('updatedPartner>>>',updatedPartner);
      

      if (!updatedPartner) {
        res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
        return;
      }

      // If email was updated, update it in auth service as well
      if (email) {
        try {
          await axios.put(`${process.env.AUTH_SERVICE_URL}/auth/update-email/${partnerId}`, {
            email: email
          });
        } catch (error) {
          console.error('Failed to update email in auth service:', error);
          // Consider whether to rollback the partner update or just log the error
        }
      }

      // Return the updated partner
      res.status(200).json({
        success: true,
        message: 'Partner updated successfully',
        partner: {
          partnerId: updatedPartner.partnerId,
          fullName: updatedPartner.fullName,
          email: updatedPartner.email,
          phone: updatedPartner.mobileNumber,
          status: updatedPartner.isActive,
          profileImage: updatedPartner.profilePicturePath 
            ? `${process.env.API_URL}/uploads/${updatedPartner.profilePicturePath}`
            : null,
          totalOrders: updatedPartner.totalOrders || 0,
          completedOrders: updatedPartner.completedOrders || 0,
          canceledOrders: updatedPartner.canceledOrders || 0,
          bankDetailsCompleted: updatedPartner.bankDetailsCompleted,
          personalDocumentsCompleted: updatedPartner.personalDocumentsCompleted,
          vehicleDetailsCompleted: updatedPartner.vehicleDetailsCompleted
        }
      });

    } catch (error) {
      console.error('Update partner error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },
  async getByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      
      const partner = await partnerRepository.findByEmail(email);
      
      if (!partner) {
        res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        partner: {
          partnerId: partner.partnerId,
          email: partner.email,
          status: partner.status
        },
        driver:partner
      });
    } catch (error) {
      console.error('Get partner by email error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },
  async updatePersonalInfo(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const { fullName, mobileNumber, address, dateOfBirth } = req.body;

      // Validate required fields
      if (!fullName || !mobileNumber || !address || !dateOfBirth) {
         res.status(400).json({
          success: false,
          error: 'All personal information fields are required'
        });
        return
      }

      const updateData = {
        fullName,
        mobileNumber,
        address,
        dateOfBirth
      };

      const updatedPartner = await partnerRepository.findByIdAndUpdate(
        partnerId,
        updateData
      );
      console.log('updatedPartner',updatedPartner);
      

      if (!updatedPartner) {
         res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
        return
      }

      res.status(200).json({
        success: true,
        message: 'Personal information updated successfully',
        partner: updatedPartner
      });

    } catch (error) {
      console.error('Update personal info error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },
  async updateVehicleInfo(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const { vehicleType, registrationNumber } = req.body;

      // Validate required fields
      if (!vehicleType || !registrationNumber) {
         res.status(400).json({
          success: false,
          error: 'All vehicle information fields are required'
        });
        return
      }

      const updateData = {
        vehicleType,
        registrationNumber
      };

      const updatedPartner = await partnerRepository.findByIdAndUpdate(
        partnerId,
        updateData
      );

      if (!updatedPartner) {
         res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
        return
      }

      res.status(200).json({
        success: true,
        message: 'Vehicle information updated successfully',
        partner: updatedPartner
      });

    } catch (error) {
      console.error('Update vehicle info error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },
  async updateBankInfo(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const { accountHolderName, accountNumber, ifscCode, upiId } = req.body;

      // Validate required fields
      if (!accountHolderName || !accountNumber || !ifscCode || !upiId) {
         res.status(400).json({
          success: false,
          error: 'All bank information fields are required'
        });
        return
      }

      const updateData = {
        accountHolderName,
        accountNumber,
        ifscCode,
        upiId
      };

      const updatedPartner = await partnerRepository.findByIdAndUpdate(
        partnerId,
        updateData
      );

      if (!updatedPartner) {
         res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
        return
      }

      res.status(200).json({
        success: true,
        message: 'Bank information updated successfully',
        partner: updatedPartner
      });

    } catch (error) {
      console.error('Update bank info error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },
  async updateProfileImage(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;
      const file = req.file as Express.MulterS3.File;

      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
        return;
      }

      const updateData = {
        profilePicturePath: file.location // S3 returns the file URL in location
      };

      const updatedPartner = await partnerRepository.findByIdAndUpdate(
        partnerId,
        updateData
      );

      if (!updatedPartner) {
        res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile image updated successfully',
        partner: {
          ...updatedPartner,
          profilePicturePath: file.location
        }
      });

    } catch (error) {
      console.error('Update profile image error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};