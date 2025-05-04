import { Router, Request, Response, NextFunction } from 'express';
import { userController } from '../../infrastructure/di/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { s3Upload } from '../../infrastructure/config/s3Config';
import { ResponseHandler } from '../utils/responseHandler';
import { ErrorMessage } from '../../types/enums/ErrorMessage';
import { StatusCode } from '../../types/enums/StatusCode';
import { ErrorCode } from '../../types/enums/ErrorCode';

const router = Router();

// Parameter validation middleware
const validateUserId = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  console.log(`Validating userId: ${userId}`); // Debugging line
  
  if (!userId) {
    ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
    return;
  }
  next();
};

// Validate address ID middleware
const validateAddressId = (req: Request, res: Response, next: NextFunction) => {
  const { addressId } = req.params;
  if (!addressId) {
    ResponseHandler.validationError(res, 'Address ID is required');
    return;
  }
  next();
};

// Public routes
router.post('/users', userController.create.bind(userController));
router.get('/users/:userId', userController.get.bind(userController));
router.get('/users/by-email/:email', userController.getByEmail.bind(userController));
router.get('/users', userController.getAll.bind(userController));


// Protected routes - require authentication
router.use(authMiddleware);

// Profile routes
router.put('/update-profile',s3Upload.single('profileImage'),userController.updateProfile.bind(userController));
router.post('/profile/image',authMiddleware,s3Upload.single('profileImage'),userController.updateProfileImage.bind(userController));

// S3 Upload route - moved to controller for better organization
router.post('/s3/upload', userController.s3Upload.bind(userController));


// User management routes
router.put('/users/:userId', validateUserId, userController.update.bind(userController));
router.put('/users/:userId/status', validateUserId, userController.updateStatus.bind(userController));
router.delete('/users/:userId', validateUserId, userController.delete.bind(userController));

// User address routes
router.post('/users/:userId/addresses', validateUserId, userController.addAddress.bind(userController));
router.get('/users/:userId/addresses', validateUserId, userController.getUserAddresses.bind(userController));
router.get('/addresses/:addressId', validateAddressId, userController.getAddress.bind(userController));
router.put('/addresses/:addressId', validateAddressId, userController.updateAddress.bind(userController));
router.delete('/addresses/:addressId', validateAddressId, userController.deleteAddress.bind(userController));
router.put('/users/:userId/addresses/:addressId/default', validateUserId, validateAddressId, userController.setDefaultAddress.bind(userController));

export default router; 