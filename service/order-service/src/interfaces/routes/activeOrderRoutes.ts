import { Router } from 'express';
import { ActiveOrderController } from '../controllers/active-order-controller';
import { StoreActiveOrderUseCase } from '../../application/use-cases/active-order/StoreActiveOrderUseCase';
import { GetActiveOrderUseCase } from '../../application/use-cases/active-order/GetActiveOrderUseCase';
import { RemoveActiveOrderUseCase } from '../../application/use-cases/active-order/RemoveActiveOrderUseCase';
import { RedisActiveOrderRepository } from '../../frameworks/database/redis/active-order-repository';
// import { authMiddleware } from '../../frameworks/webserver/middlewares/auth';

export const configureActiveOrderRoutes = (router: Router) => {
  // Create repository
  const activeOrderRepository = new RedisActiveOrderRepository();
  
  // Create use cases
  const storeActiveOrderUseCase = new StoreActiveOrderUseCase(activeOrderRepository);
  const getActiveOrderUseCase = new GetActiveOrderUseCase(activeOrderRepository);
  const removeActiveOrderUseCase = new RemoveActiveOrderUseCase(activeOrderRepository);
  
  // Create controller
  const activeOrderController = new ActiveOrderController(
    storeActiveOrderUseCase,
    getActiveOrderUseCase,
    removeActiveOrderUseCase
  );

  /**
   * @route POST /api/active-orders/:userId
   * @description Store an active order for a user
   * @access Authenticated
   */
  router.post('/active-orders/:userId', (req, res) => 
    activeOrderController.storeActiveOrder(req, res)
  );

  /**
   * @route GET /api/active-orders/:userId
   * @description Get active order for a user
   * @access Authenticated
   */
  router.get('/active-orders/:userId', (req, res) => 
    activeOrderController.getActiveOrder(req, res)
  );

  /**
   * @route DELETE /api/active-orders/:userId
   * @description Remove active order for a user
   * @access Authenticated
   */
  router.delete('/active-orders/:userId', (req, res) => 
    activeOrderController.removeActiveOrder(req, res)
  );

  return router;
}; 