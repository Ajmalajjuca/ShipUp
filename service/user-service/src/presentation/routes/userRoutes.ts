import express from 'express';
import { userController } from '../controllers/userController';

const router = express.Router();

router.post('/users', userController.create);
router.get('/users/:userId', userController.get);
router.put('/users/:userId', userController.update);
router.delete('/users/:userId', userController.delete);

export default router;