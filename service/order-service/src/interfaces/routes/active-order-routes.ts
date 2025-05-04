import { Router } from 'express';
import { ActiveOrderController } from '../controllers/active-order-controller';
import { authMiddleware } from '../../frameworks/webserver/middlewares/auth';

export const activeOrderRouter = (controller: ActiveOrderController) => {
  const router = Router();

  // Store active order
  router.post(
    '/:userId',
    authMiddleware,
    (req, res) => controller.storeActiveOrder(req, res)
  );

  // Get active order
  router.get(
    '/:userId',
    authMiddleware,
    (req, res) => controller.getActiveOrder(req, res)
  );

  // Remove active order
  router.delete(
    '/:userId',
    authMiddleware,
    (req, res) => controller.removeActiveOrder(req, res)
  );

  return router;
}; 