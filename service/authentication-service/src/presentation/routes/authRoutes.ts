import express from 'express';
import { authController } from '../controllers/authController2';
import multer from 'multer';

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

export default router;