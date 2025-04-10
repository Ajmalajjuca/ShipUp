import { Router, Request, Response } from 'express';
import type { userController as UserControllerType } from '../controllers/userController';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { s3Upload } from '../../infrastructure/config/s3Config';
import jwt from 'jsonwebtoken';

const router = Router();

// Public routes
router.post('/users', userController.create);
router.get('/users/:userId', userController.get);

// Add this new route before the protected routes
router.get('/users', userController.getAll);

// Add this route
router.get('/users/by-email/:email', userController.getByEmail);

// Add update-profile route before authentication middleware
router.put('/update-profile', 
  s3Upload.single('profileImage'),
  userController.updateProfile
);

// S3 Upload route - Modified to handle both authenticated users and temporary tokens
router.post('/s3/upload', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
       res.status(401).json({ error: 'No authorization token provided' });
       return
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
       res.status(401).json({ error: 'Invalid authorization format' });
       return
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Check if it's a temporary token specifically for document uploads
      const isTemporaryUploadToken = decoded.purpose === 'document-upload' && decoded.role === 'driver';
      
      // If not a temporary token or authenticated user, continue with the upload
      if (!isTemporaryUploadToken && !decoded.userId) {
         res.status(401).json({ error: 'Invalid token for this operation' });
         return
      }
      
      // Determine which field to use based on the type parameter
      const fieldName = req.query.type === 'profile' ? 'profileImage' : 'file';
      console.log('Using field name for upload:', fieldName);
      
      // Process the upload with S3
      s3Upload.single(fieldName)(req, res, (err) => {
        if (err) {
           res.status(400).json({ error: 'Error uploading file: ' + err.message });
           return
        }
        
        if (!req.file) {
           res.status(400).json({ error: 'No file uploaded' });
           return
        }
        
        const s3File = req.file as Express.MulterS3.File;
        console.log('File uploaded successfully to S3:', {
          fieldName,
          originalname: s3File.originalname,
          location: s3File.location
        });
        
        res.json({ 
          success: true,
          message: 'File uploaded successfully',
          fileUrl: s3File.location,
          fileType: fieldName === 'profileImage' ? 'profile' : 'document'
        });
      });
      
    } catch (error: any) {
      console.error('Token verification error:', error.message);
       res.status(401).json({ error: 'Invalid or expired token' });
       return
    }
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes - require authentication
router.use(authMiddleware);

router.put('/users/:userId', userController.update);
router.put('/users/:userId/status', userController.updateStatus);
router.delete('/users/:userId', userController.delete);

export default router;