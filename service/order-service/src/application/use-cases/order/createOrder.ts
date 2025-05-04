import { OrderRepository } from '../../../domain/repositories/orderRepository';
import { Order, OrderItem, OrderStatus } from '../../../domain/entities/Order';

// Create order input DTO
export interface CreateOrderDTO {
  customerId: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

// Dependencies
interface Dependencies {
  orderRepository: OrderRepository;
  calculateTotalAmount: (items: OrderItem[]) => number;
}

// Create order use case
export const createOrder = (dependencies: Dependencies) => {
  const { orderRepository, calculateTotalAmount } = dependencies;
  
  return async (orderInput: CreateOrderDTO): Promise<Order> => {
    try {
      // Calculate total amount
      const totalAmount = calculateTotalAmount(orderInput.items);
      
      // Create the order
      const order = await orderRepository.create({
        customerId: orderInput.customerId,
        items: orderInput.items,
        totalAmount,
        status: OrderStatus.PENDING,
        shippingAddress: orderInput.shippingAddress
      });
      
      return order;
    } catch (error) {
      console.error('Error in createOrder use case:', error);
      throw error;
    }
  };
}; 