import { Router } from 'express';
import OrderController from '../controllers/orderController';

export const configureOrderRoutes = (router: Router) => {
  const orderController = new OrderController();

  /**
   * @route POST /api/orders
   * @description Create a new order
   * @access Public (in a real app, would be authenticated)
   */
  router.post('/orders', orderController.createOrder);
  
  /**
   * @route GET /api/orders
   * @description Get all orders
   * @access Public (in a real app, would be restricted to admin)
   */
  router.get('/orders', orderController.getAllOrders);
  
  /**
   * @route GET /api/orders/:id
   * @description Get order by ID
   * @access Public (in a real app, would be authenticated)
   */
  router.get('/orders/:id', orderController.getOrderById);
  
  /**
   * @route GET /api/orders/user/:userId
   * @description Get orders by user ID
   * @access Public (in a real app, would be authenticated)
   */
  router.get('/orders/user/:userId', orderController.getOrdersByUserId.bind(orderController));
  
  /**
   * @route PATCH /api/orders/:id
   * @description Update an order
   * @access Public (in a real app, would be authenticated)
   */
  router.put('/orders/:id', orderController.updateOrder);
  
  /**
   * @route PATCH /api/orders/:id/status
   * @description Update order status
   * @access Public (in a real app, would be authenticated)
   */
  router.patch('/orders/:id/status', orderController.updateOrderStatus.bind(orderController));
  
  /**
   * @route POST /api/orders/payment
   * @description Process payment for an order
   * @access Public (in a real app, would be authenticated)
   */
  router.post('/orders/payment', orderController.processPayment.bind(orderController));
  
  /**
   * @route GET /api/orders/payment/:orderId
   * @description Get payment status for an order
   * @access Public (in a real app, would be authenticated)
   */
  router.get('/orders/payment/:orderId', orderController.getPaymentStatus.bind(orderController));
  
  /**
   * @route POST /api/orders/refund/:orderId
   * @description Process refund for an order
   * @access Public (in a real app, would be restricted to admin)
   */
  router.post('/orders/refund/:orderId', orderController.processRefund.bind(orderController));
  
  /**
   * @route DELETE /api/orders/:id
   * @description Delete an order
   * @access Public (in a real app, would be restricted to admin)
   */
  router.delete('/orders/:id', orderController.deleteOrder);
  
  return router;
}; 