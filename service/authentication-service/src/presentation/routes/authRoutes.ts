import express from 'express';
import { authController } from '../controllers/authController2';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.get('/verify-token', authController.verifyToken);
router.get('/verify-partner-token', authController.verifyPartnerToken);

router.post('/register-driver', upload.any(), authController.registerDriver);
router.post('/send-otp', authController.sendOtp);
router.post('/login-otp', authController.requestLoginOtp);
router.post('/verify-login-otp', authController.verifyLoginOtp);

router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

router.post('/verify-password', authController.verifyPassword);
router.put('/update-password', authController.updatePassword);

router.post('/google', authController.googleLogin);

// Add the new route for updating email
router.put('/update-email/:partnerId', authController.updateEmail);

interface DecodedToken {
  email: string;
  role: string;
  [key: string]: any;
}

router.post('/verify-partner-token', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { email } = req.body;

    if (!token || !email) {
       res.status(401).json({
        success: false,
        message: 'No token or email provided'
      });
      return
    }

    // Verify the token with proper typing
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    // Check if the token belongs to the partner
    if (decoded.email !== email || decoded.role !== 'driver') {
       res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;