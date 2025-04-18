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
  if (!userId) {
    ResponseHandler.validationError(res, ErrorMessage.USER_ID_REQUIRED);
    return;
  }
  next();
};

// Public routes
router.post('/users', userController.create.bind(userController));
router.get('/users/:userId', validateUserId, userController.get.bind(userController));
router.get('/users/by-email/:email', userController.getByEmail.bind(userController));
router.get('/users', userController.getAll.bind(userController));

// Profile routes
router.put('/update-profile',s3Upload.single('profileImage'),userController.updateProfile.bind(userController));
router.post('/profile/image',authMiddleware,s3Upload.single('profileImage'),userController.updateProfileImage.bind(userController));

// S3 Upload route - moved to controller for better organization
router.post('/s3/upload', userController.s3Upload.bind(userController));

// Protected routes - require authentication
router.use(authMiddleware);

// User management routes
router.put('/users/:userId', validateUserId, userController.update.bind(userController));
router.put('/users/:userId/status', validateUserId, userController.updateStatus.bind(userController));
router.delete('/users/:userId', validateUserId, userController.delete.bind(userController));

export default router; 