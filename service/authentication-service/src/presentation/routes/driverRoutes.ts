import express from 'express';
import { DriverController } from '../controllers/driverController';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();



router.post(
    '/register',
    upload.fields([
        { name: 'aadhar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
        { name: 'license', maxCount: 1 },
        { name: 'insuranceDoc', maxCount: 1 },
        { name: 'pollutionDoc', maxCount: 1 },
        { name: 'profilePicture', maxCount: 1 }
    ]),
    DriverController.registerDriver
);
router.post('/send-otp', DriverController.sendOtp);
router.post('/verify-otp', DriverController.verifyOtp);
router.post('/resend-otp', DriverController.resendOtp);
router.get('/verify-doc', DriverController.verifydoc);

export default router;
