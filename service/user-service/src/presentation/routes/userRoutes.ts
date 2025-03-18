import express from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../../infrastructure/config/multerConfig';

const router = express.Router();

// Public routes
router.post('/users', userController.create);
router.get('/users/:userId', userController.get);

// Add this new route before the protected routes
router.get('/users', userController.getAll);

// Protected routes - require authentication
router.use(authMiddleware);

router.put('/users/:userId', userController.update);
router.delete('/users/:userId', userController.delete);
router.put('/update-profile', 
  upload.single('profileImage'), 
  userController.updateProfile
);

export default router;