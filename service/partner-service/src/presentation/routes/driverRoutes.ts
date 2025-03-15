import express from 'express';
import { partnerController } from '../controllers//driverController';

const router = express.Router();

router.post('/drivers', partnerController.create);
router.get('/drivers/verify-doc', partnerController.verifyDoc);

export default router;