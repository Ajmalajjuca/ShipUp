import express from 'express';
import { authController } from '../controllers/authController2';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Registration and authentication routes
router.post('/register', authController.register);
router.post('/register-driver', upload.any(), authController.registerDriver);
router.post('/login', authController.login);
router.post('/login-otp', authController.requestLoginOtp);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password', authController.forgotPassword);
router.delete('/:userId', authController.delete);

// Token verification routes
router.get('/verify-token', authController.verifyToken);
router.post('/verify-partner-token', authController.verifyPartnerToken);
router.post('/verify-password', authController.verifyPassword);
router.put('/update-password', authController.updatePassword);

// Social login routes
router.post('/google', authController.googleLogin);

// Partner specific routes
router.put('/update-email/:partnerId', authController.updateEmail);

// Temp token for document uploads
router.post('/temp-token', authController.createTempToken);

router.post('/verify-partner-token', authController.verifyPartnerToken);

export default router;