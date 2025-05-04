import { Request, Response } from 'express';
import { CreateUser } from '../../domain/use-cases/createUser';
import { GetUser } from '../../domain/use-cases/getUser';
import { UpdateUser } from '../../domain/use-cases/updateUser';
import { DeleteUser } from '../../domain/use-cases/deleteUser';
import { UserRepository } from '../../domain/repositories/userRepository';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { ResponseHandler } from '../utils/responseHandler';
import { ErrorMessage } from '../../types/enums/ErrorMessage';
import { StatusCode } from '../../types/enums/StatusCode';
import { ErrorCode } from '../../types/enums/ErrorCode';
import { s3Upload } from '../../infrastructure/config/s3Config';
import validator from 'validator';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UpdateProfileRequest,
  GetUserByEmailRequest
} from '../../types/interfaces/requests';
import {
  UserResponse,
  UsersResponse,
  UpdateProfileResponse,
  DeleteUserResponse,
  UserStatusResponse
} from '../../types/interfaces/responses';
import { AddAddress } from '../../domain/use-cases/addAddress';
import { AddressRepository } from '../../domain/repositories/addressRepository';
import { 
  AddAddressRequest, 
  UpdateAddressRequest, 
  DeleteAddressRequest, 
  SetDefaultAddressRequest
} from '../../types/interfaces/requests';
import { 
  AddressResponse, 
  AddressesResponse, 
  DeleteAddressResponse 
} from '../../types/interfaces/responses';

export class UserController {
  constructor(
    private userRepository: UserRepository,
    private createUserUseCase: CreateUser,
    private getUserUseCase: GetUser,
    private updateUserUseCase: UpdateUser,
    private deleteUserUseCase: DeleteUser,
    private addressRepository: AddressRepository,
    private addAddressUseCase: AddAddress
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    console.log('Creating user with data:', req.body); // Debugging line
    
    try {
      const { userId, fullName, phone, email } = req.body as CreateUserRequest;

      // Validate required fields
      if (!userId || !fullName || !email) {
        ResponseHandler.validationError(res, ErrorMessage.MISSING_REQUIRED_FIELDS);
        return;
      }

      // Validate email using validator
      if (!validator.isEmail(email)) {
        ResponseHandler.validationError(res, ErrorMessage.INVALID_EMAIL_FORMAT);
        return;
      }

      // Validate phone format if provided
      if (phone && !this.validatePhoneNumber(phone)) {
        ResponseHandler.validationError(res, ErrorMessage.INVALID_PHONE_FORMAT);
        return;
      }

      const result = await this.createUserUseCase.execute({ userId, fullName, phone, email });
      
      if (result.success) {
        ResponseHandler.created(res, {
          message: ErrorMessage.USER_CREATED,
          user: result.user
        });
      } else {
        ResponseHandler.error(
          res,
          result.error || ErrorMessage.INTERNAL_SERVER_ERROR,
          StatusCode.BAD_REQUEST
        );
      }
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    try {
      
      
      if (!userId) {
        ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
        return;
      }

      const user = await this.userRepository.findById(userId);
      
      
      if (!user) {
        ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        return;
      }

      // Add full URL for profile image
      const userData = {
        ...user,
        profileImage: user.profileImage ? `${user.profileImage}` : undefined
      };

      const response: UserResponse = {
        success: true,
        user: userData
      };

      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const updateData = req.body as UpdateUserRequest;
      
      if (!userId) {
        ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
        return;
      }

      // Validate phone format if provided
      if (updateData.phone && !this.validatePhoneNumber(updateData.phone)) {
        ResponseHandler.validationError(res, ErrorMessage.INVALID_PHONE_FORMAT);
        return;
      }

      const result = await this.updateUserUseCase.execute(userId, updateData);
      
      if (result.success) {
        ResponseHandler.success(res, {
          message: ErrorMessage.USER_UPDATED,
          user: result.user
        });
      } else {
        if (result.error === 'User not found') {
          ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        } else {
          ResponseHandler.error(
            res,
            result.error || ErrorMessage.INTERNAL_SERVER_ERROR,
            StatusCode.BAD_REQUEST
          );
        }
      }
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
        return;
      }

      const result = await this.deleteUserUseCase.execute(userId);
      
      if (result.success) {
        const response: DeleteUserResponse = {
          success: true,
          message: ErrorMessage.USER_DELETED,
          userId
        };
        
        ResponseHandler.success(res, response);
      } else {
        if (result.error === 'User not found') {
          ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        } else {
          ResponseHandler.error(
            res,
            result.error || ErrorMessage.INTERNAL_SERVER_ERROR,
            StatusCode.BAD_REQUEST
          );
        }
      }
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }
  
  async s3Upload(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        ResponseHandler.unauthorized(res, ErrorMessage.AUTH_HEADER_REQUIRED, ErrorCode.AUTH_HEADER_REQUIRED);
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        ResponseHandler.unauthorized(res, 'Invalid authorization format', ErrorCode.INVALID_TOKEN);
        return;
      }

      try {
        // Verify the token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        // Check if it's a temporary token specifically for document uploads
        const isTemporaryUploadToken = decoded.purpose === 'document-upload' && decoded.role === 'driver';
        
        // If not a temporary token or authenticated user, continue with the upload
        if (!isTemporaryUploadToken && !decoded.userId) {
          ResponseHandler.unauthorized(res, 'Invalid token for this operation', ErrorCode.INVALID_TOKEN);
          return;
        }
        
        // Validate upload type
        const fileType = req.query.type as string;
        if (!fileType || !['profile', 'document', 'license', 'idproof'].includes(fileType)) {
          ResponseHandler.validationError(res, 'Invalid file type specified');
          return;
        }
        
        // Determine which field to use based on the type parameter
        const fieldName = fileType === 'profile' ? 'profileImage' : 'file';
        
        // Process the upload with S3
        s3Upload.single(fieldName)(req, res, (err) => {
          if (err) {
            ResponseHandler.error(
              res, 
              'Error uploading file: ' + err.message, 
              StatusCode.BAD_REQUEST,
              ErrorCode.FILE_UPLOAD_ERROR
            );
            return;
          }
          
          if (!req.file) {
            ResponseHandler.validationError(res, 'No file uploaded');
            return;
          }
          
          const s3File = req.file as Express.MulterS3.File;
          
          // Validate file size (max 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (s3File.size > maxSize) {
            ResponseHandler.validationError(res, 'File size exceeds the 5MB limit', { size: s3File.size });
            return;
          }
          
          // Validate file type
          const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
          if (!allowedMimeTypes.includes(s3File.mimetype)) {
            ResponseHandler.validationError(res, 'Invalid file format', { mimetype: s3File.mimetype });
            return;
          }

          ResponseHandler.success(res, {
            message: 'File uploaded successfully',
            fileUrl: s3File.location,
            fileType: fieldName === 'profileImage' ? 'profile' : fileType,
            fileName: s3File.key
          });
        });
        
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          ResponseHandler.unauthorized(res, 'Token has expired', ErrorCode.TOKEN_EXPIRED);
        } else {
          ResponseHandler.unauthorized(res, 'Invalid token', ErrorCode.INVALID_TOKEN);
        }
        return;
      }
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }
  
  async updateProfileImage(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated user
      if (!req.user || !req.user.userId) {
        ResponseHandler.unauthorized(res, 'User not authenticated', ErrorCode.INVALID_TOKEN);
        return;
      }
      
      const userId = req.user.userId;
      const file = req.file;
      
      if (!file) {
        ResponseHandler.validationError(res, 'No profile image provided');
        return;
      }
      
      // Get user from repository
      const user = await this.userRepository.findById(userId);
      if (!user) {
        ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        return;
      }
      
      // Get S3 file location
      const s3File = file as Express.MulterS3.File;
      const profileImageUrl = s3File.location;
      
      // Update user in database with new profile image
      const updatedUser = await this.userRepository.updateProfileImage(userId, profileImageUrl);
      
      if (!updatedUser) {
        ResponseHandler.error(res, 'Failed to update profile image', StatusCode.INTERNAL_SERVER_ERROR);
        return;
      }
      
      ResponseHandler.success(res, {
        success: true,
        message: 'Profile image updated successfully',
        profileImage: profileImageUrl
      });
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated user or body
      let userId;
      if (req.user && req.user.userId) {
        userId = req.user.userId;
      } else if (req.body.userId) {
        userId = req.body.userId;
      } else {
        ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
        return;
      }
      
      const { fullName, phone, currentPassword, newPassword, profileImagePath } = req.body as UpdateProfileRequest;
      const profileImage = req.file;
      
      // Get auth token from headers
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        ResponseHandler.unauthorized(res, ErrorMessage.AUTH_HEADER_REQUIRED);
        return;
      }
      
      // Validate phone format if provided
      if (phone && !this.validatePhoneNumber(phone)) {
        ResponseHandler.validationError(res, ErrorMessage.INVALID_PHONE_FORMAT);
        return;
      }
      
      // If password change is requested, verify with auth service first
      if (currentPassword && newPassword) {
        try {
          const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
          const authResponse = await axios.put(`${authServiceUrl}/auth/update-password`, {
            userId,
            currentPassword,
            newPassword
          }, {
            headers: {
              Authorization: authHeader
            }
          });
          console.log('Auth service response:', authResponse.data);
          
          const authData = authResponse.data as { success: boolean };
          if (!authData.success) {
            ResponseHandler.error(
              res,
              ErrorMessage.PASSWORD_CHANGE_FAILED,
              StatusCode.BAD_REQUEST,
              ErrorCode.PASSWORD_CHANGE_FAILED,
              { passwordError: true, shouldClearSession: false }
            );
            return;
          }
        } catch (error: any) {
          
          
          ResponseHandler.error(
            res,
            error.response?.data.error || ErrorMessage.PASSWORD_CHANGE_FAILED,
            StatusCode.BAD_REQUEST,
            ErrorCode.PASSWORD_CHANGE_FAILED,
            { passwordError: true, shouldClearSession: false }
          );
          return;
        }
      }

      // Get user from repository
      const user = await this.userRepository.findById(userId);
      if (!user) {
        ResponseHandler.notFound(
          res, 
          ErrorMessage.USER_NOT_FOUND,
          { shouldClearSession: true }
        );
        return;
      }

      // Update profile fields
      const updateData: Partial<UpdateUserRequest> = {};
      
      if (fullName) updateData.fullName = fullName;
      if (phone) {
        updateData.phone = phone;
      }
      
      // Handle profile image upload
      let imageUrl = user.profileImage;
      
      if (profileImage) {
        // Process the uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(profileImage.originalname);
        const fileName = `profile-${userId}-${uniqueSuffix}${fileExtension}`;
        const savePath = path.join(__dirname, '../../../uploads', fileName);
        
        try {
          // Create directory if it doesn't exist
          if (!fs.existsSync(path.join(__dirname, '../../../uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../../../uploads'), { recursive: true });
          }
          
          // Move file from temp location to our uploads folder
          fs.copyFileSync(profileImage.path, savePath);
          fs.unlinkSync(profileImage.path); // Remove the temp file
          
          // Generate URL for the image
          const apiUrl = process.env.API_URL || 'http://localhost:3002';
          imageUrl = `${apiUrl}/uploads/${fileName}`;
          updateData.profileImage = imageUrl;
        } catch (error) {
          console.error('Error saving profile image:', error);
          ResponseHandler.error(
            res,
            ErrorMessage.FILE_UPLOAD_ERROR,
            StatusCode.INTERNAL_SERVER_ERROR,
            ErrorCode.FILE_UPLOAD_ERROR
          );
          return;
        }
      } else if (profileImagePath) {
        // If an image path is provided directly (like from S3)
        updateData.profileImage = profileImagePath;
      }
      
      // Update user in database
      const updatedUser = await this.userRepository.update(userId, updateData);
      
      if (!updatedUser) {
        ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        return;
      }
      
      const response: UpdateProfileResponse = {
        success: true,
        message: ErrorMessage.PROFILE_UPDATED,
        user: {
          userId: updatedUser.userId,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage,
          status: updatedUser.status,
          isVerified: updatedUser.isVerified,
          onlineStatus: updatedUser.onlineStatus
        }
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userRepository.findAll();
      
      const usersWithImageUrls = users.map(user => ({
        ...user,
        profileImage: user.profileImage ? `${user.profileImage}` : undefined
      }));
      
      const response: UsersResponse = {
        success: true,
        users: usersWithImageUrls
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body as UpdateUserStatusRequest;
      
      if (!userId) {
        ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
        return;
      }
      
      if (status === undefined) {
        ResponseHandler.validationError(res, 'Status is required');
        return;
      }
      
      const updatedUser = await this.userRepository.updateStatus(userId, status);
      
      if (!updatedUser) {
        ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        return;
      }
      
      const response: UserStatusResponse = {
        success: true,
        message: ErrorMessage.STATUS_UPDATED,
        userId: updatedUser.userId,
        status: updatedUser.status
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  async getByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      
      if (!email) {
        ResponseHandler.validationError(res, 'Email is required');
        return;
      }
      
      // Validate email
      if (!validator.isEmail(email)) {
        ResponseHandler.validationError(res, ErrorMessage.INVALID_EMAIL_FORMAT);
        return;
      }
      
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        return;
      }
      
      // Add full URL for profile image
      const userData = {
        ...user,
        profileImage: user.profileImage ? `${user.profileImage}` : undefined
      };
      
      const response: UserResponse = {
        success: true,
        user: userData
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }
  
  // Helper method for phone validation
  private validatePhoneNumber(phone: string): boolean {
    // Use validator.js instead of regex
    if (validator.isEmpty(phone)) {
      return false;
    }
    
    // Remove all non-digit characters for standardization
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Check if it's an Indian phone number (with or without country code)
    // Indian mobile numbers are 10 digits, starting with 6-9
    // With country code it would be +91 followed by the 10 digits
    if (cleanedPhone.length === 10) {
      return /^[6-9]\d{9}$/.test(cleanedPhone);
    } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91')) {
      return /^91[6-9]\d{9}$/.test(cleanedPhone);
    }
    
    return false;
  }

  /**
   * Add a new address for a user
   */
  async addAddress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const addressData = req.body as AddAddressRequest;
      console.log('Address Data:', addressData);
      console.log('User ID:', userId);
      
      
      if (!userId) {
        ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
        return;
      }

      // Validate required fields
      if (!addressData.type || !addressData.street) {
        ResponseHandler.validationError(res, 'Address type and street are required');
        return;
      }

      const result = await this.addAddressUseCase.execute(userId, addressData);
      
      if (result.success) {
        const response: AddressResponse = {
          success: true,
          message: 'Address added successfully',
          address: result.address!
        };
        
        ResponseHandler.created(res, response);
      } else {
        if (result.error === 'User not found') {
          ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        } else {
          ResponseHandler.error(
            res,
            result.error || ErrorMessage.INTERNAL_SERVER_ERROR,
            StatusCode.BAD_REQUEST
          );
        }
      }
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
        return;
      }

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        return;
      }

      const addresses = await this.addressRepository.findByUserId(userId);
      
      const response: AddressesResponse = {
        success: true,
        addresses
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  /**
   * Get a specific address by ID
   */
  async getAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId } = req.params;
      
      if (!addressId) {
        ResponseHandler.validationError(res, 'Address ID is required');
        return;
      }

      const address = await this.addressRepository.findById(addressId);
      
      if (!address) {
        ResponseHandler.notFound(res, 'Address not found');
        return;
      }

      const response: AddressResponse = {
        success: true,
        address
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  /**
   * Update an address
   */
  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId } = req.params;
      const updateData = req.body as UpdateAddressRequest;
      
      if (!addressId) {
        ResponseHandler.validationError(res, 'Address ID is required');
        return;
      }

      // Check if address exists
      const existingAddress = await this.addressRepository.findById(addressId);
      if (!existingAddress) {
        ResponseHandler.notFound(res, 'Address not found');
        return;
      }

      // Make sure the user owns this address (security check)
      if (req.user && existingAddress.userId !== req.user.userId) {
        ResponseHandler.forbidden(res, 'You do not have permission to update this address');
        return;
      }

      const updatedAddress = await this.addressRepository.update(addressId, updateData);
      
      if (!updatedAddress) {
        ResponseHandler.notFound(res, 'Address not found');
        return;
      }

      const response: AddressResponse = {
        success: true,
        message: 'Address updated successfully',
        address: updatedAddress
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  /**
   * Delete an address
   */
  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId } = req.params;
      
      if (!addressId) {
        ResponseHandler.validationError(res, 'Address ID is required');
        return;
      }

      // Check if address exists
      const existingAddress = await this.addressRepository.findById(addressId);
      if (!existingAddress) {
        ResponseHandler.notFound(res, 'Address not found');
        return;
      }

      // Make sure the user owns this address (security check)
      if (req.user && existingAddress.userId !== req.user.userId) {
        ResponseHandler.forbidden(res, 'You do not have permission to delete this address');
        return;
      }

      const result = await this.addressRepository.delete(addressId);
      
      if (!result) {
        ResponseHandler.notFound(res, 'Address not found');
        return;
      }

      const response: DeleteAddressResponse = {
        success: true,
        message: 'Address deleted successfully',
        addressId
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const { userId, addressId } = req.params;
      
      if (!userId || !addressId) {
        ResponseHandler.validationError(res, 'User ID and Address ID are required');
        return;
      }

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        ResponseHandler.notFound(res, ErrorMessage.USER_NOT_FOUND);
        return;
      }

      // Check if address exists
      const existingAddress = await this.addressRepository.findById(addressId);
      if (!existingAddress) {
        ResponseHandler.notFound(res, 'Address not found');
        return;
      }

      // Make sure the user owns this address (security check)
      if (existingAddress.userId !== userId) {
        ResponseHandler.forbidden(res, 'This address does not belong to the specified user');
        return;
      }

      const updatedAddress = await this.addressRepository.setDefault(userId, addressId);
      
      if (!updatedAddress) {
        ResponseHandler.notFound(res, 'Address not found');
        return;
      }

      const response: AddressResponse = {
        success: true,
        message: 'Address set as default successfully',
        address: updatedAddress
      };
      
      ResponseHandler.success(res, response);
    } catch (error) {
      ResponseHandler.handleError(res, error);
    }
  }
}