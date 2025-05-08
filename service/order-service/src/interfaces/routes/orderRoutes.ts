import { Router } from 'express';
import OrderController from '../controllers/orderController';

export const configureOrderRoutes = (router: Router) => {
  const orderController = new OrderController();

  
  router.post('/orders', orderController.createOrder);
  router.get('/orders', orderController.getAllOrders);
  router.get('/orders/:id', orderController.getOrderById);
  router.get('/orders/user/:userId', orderController.getOrdersByUserId.bind(orderController));
  router.get('/orders/drivers/:partnerId', orderController.getOrdersByDriversId.bind(orderController));
  router.put('/orders/:id', orderController.updateOrder);
  router.patch('/orders/:id', orderController.updateOrder);
  router.patch('/orders/:id/status', orderController.updateOrderStatus.bind(orderController));
  router.post('/orders/payment', orderController.processPayment.bind(orderController));
  router.get('/orders/payment/:orderId', orderController.getPaymentStatus.bind(orderController));
  router.post('/orders/refund/:orderId', orderController.processRefund.bind(orderController));
  router.delete('/orders/:id', orderController.deleteOrder);
  
  return router;
}; 