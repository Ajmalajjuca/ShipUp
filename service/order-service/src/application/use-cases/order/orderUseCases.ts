import { OrderRepository, PaymentData } from '../../../domain/repositories/orderRepository';
import { Order } from '../../../domain/entities/Order';

// Get all orders
export const getAllOrders = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (): Promise<Order[]> => {
    try {
      return await orderRepository.findAll();
    } catch (error) {
      console.error('Error in getAllOrders use case:', error);
      throw error;
    }
  };
};

// Get order by ID
export const getOrderById = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (id: string): Promise<Order | null> => {
    try {
      return await orderRepository.findById(id);
    } catch (error) {
      console.error(`Error in getOrderById use case for ID ${id}:`, error);
      throw error;
    }
  };
};

// Get orders by user ID
export const getOrdersByUserId = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (userId: string): Promise<Order[]> => {
    try {
      return await orderRepository.findByUserId(userId);
    } catch (error) {
      console.error(`Error in getOrdersByUserId use case for user ${userId}:`, error);
      throw error;
    }
  };
};

// Update order
export const updateOrder = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (id: string, orderData: Partial<Order>): Promise<Order | null> => {
    try {
      return await orderRepository.update(id, orderData);
    } catch (error) {
      console.error(`Error in updateOrder use case for ID ${id}:`, error);
      throw error;
    }
  };
};

// Update order status
export const updateOrderStatus = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (id: string, status: string, description?: string): Promise<Order | null> => {
    try {
      return await orderRepository.updateStatus(id, status, description);
    } catch (error) {
      console.error(`Error in updateOrderStatus use case for ID ${id}:`, error);
      throw error;
    }
  };
};

// Process payment
export const processPayment = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (paymentData: PaymentData): Promise<Order | null> => {
    try {
      return await orderRepository.processPayment(paymentData);
    } catch (error) {
      console.error(`Error in processPayment use case for order ${paymentData.orderId}:`, error);
      throw error;
    }
  };
};

// Get payment status
export const getPaymentStatus = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (orderId: string): Promise<{
    orderId: string;
    paymentStatus: string;
    amount: number;
  } | null> => {
    try {
      return await orderRepository.getPaymentStatus(orderId);
    } catch (error) {
      console.error(`Error in getPaymentStatus use case for order ${orderId}:`, error);
      throw error;
    }
  };
};

// Process refund
export const processRefund = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (orderId: string): Promise<Order | null> => {
    try {
      return await orderRepository.processRefund(orderId);
    } catch (error) {
      console.error(`Error in processRefund use case for order ${orderId}:`, error);
      throw error;
    }
  };
};

// Delete order
export const deleteOrder = (dependencies: { orderRepository: OrderRepository }) => {
  const { orderRepository } = dependencies;
  
  return async (id: string): Promise<boolean> => {
    try {
      return await orderRepository.delete(id);
    } catch (error) {
      console.error(`Error in deleteOrder use case for ID ${id}:`, error);
      throw error;
    }
  };
}; 