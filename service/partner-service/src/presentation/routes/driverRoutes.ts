import express from 'express';
import { partnerController } from '../controllers/driverController';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { upload } from '../../utils/s3Config';

const router = express.Router();

// Configure storage for different document types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '../../../uploads');
    
    // Determine the appropriate subdirectory based on fieldname
    if (file.fieldname === 'profilePicture') {
      uploadPath = path.join(uploadPath, 'profile-images');
    } else {
      uploadPath = path.join(uploadPath, 'documents', file.fieldname);
    }
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Add file extension to maintain file type
    const fileExt = path.extname(file.originalname);
    // Use a unique filename
    cb(null, `${Date.now()}${fileExt}`);
  }
});

// Add file filter to validate uploads
const fileFilter = (req: any, file: any, cb: any) => {
  // Accept images and documents
  if (file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const uploadMulter = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.post('/drivers', 
  uploadMulter.fields([
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'license', maxCount: 1 },
    { name: 'insuranceDoc', maxCount: 1 },
    { name: 'pollutionDoc', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
  ]),
  partnerController.create
);

// Routes that accept both admin and partner tokens
router.get('/drivers/verify-doc', authMiddleware, partnerController.verifyDoc);

// Admin-only routes
router.get('/drivers', adminOnly, partnerController.getAll);
router.put('/drivers/:partnerId/status', adminOnly, partnerController.updateStatus);
router.delete('/drivers/:partnerId', adminOnly, partnerController.delete);
router.get('/drivers/:partnerId', partnerController.getById);
router.put('/drivers/:partnerId/verification', adminOnly, partnerController.updateVerificationStatus);
router.put('/drivers/:partnerId', adminOnly, partnerController.update);

// Add this route
router.get('/drivers/by-email/:email', partnerController.getByEmail);

// Add these new routes for profile updates
router.put('/drivers/:partnerId/personal', authMiddleware, partnerController.updatePersonalInfo);
router.put('/drivers/:partnerId/vehicle', authMiddleware, partnerController.updateVehicleInfo);
router.put('/drivers/:partnerId/bank', authMiddleware, partnerController.updateBankInfo);
router.put('/drivers/:partnerId/profile-image', 
  authMiddleware,
  upload.single('profileImage'),
  partnerController.updateProfileImage
);

export default router;