import express from 'express';
import { authController } from '../controllers/authController2';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);

router.post('/register-driver', upload.any(), authController.registerDriver);
router.post('/send-otp', authController.sendOtp);
router.post('/login-otp', authController.requestLoginOtp);
router.post('/verify-login-otp', authController.verifyLoginOtp);

export default router;