import { OrderRepository, PaymentData } from '../../domain/repositories/orderRepository';
import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../../domain/entities/Order';
import { calculateTotalAmount } from './order/orderUtils';

// Create order input DTO
export interface CreateOrderDTO {
  userId: string;
  price: number;
  vehicleId: string;
  vehicleName: string;
  basePrice: number;
  deliveryPrice: number;
  commission: number;
  gstAmount: number;
  distance: number;
  estimatedTime: number;
  deliveryType: string;
  pickupAddress: {
    street: string;
    latitude?: number;
    longitude?: number;
  };
  dropoffAddress: {
    street: string;
    latitude?: number;
    longitude?: number;
  };
  paymentMethod: string;
  paymentStatus: string;
}

// Filter options for orders
export interface OrderFilterOptions {
  userId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export default class OrderUseCase {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  // Create a new order
  async createOrder(orderInput: CreateOrderDTO): Promise<Order> {
    
    try {
      // Calculate total amount

      // Create the order
      const order = await this.orderRepository.create({
        customerId: orderInput.userId,
        vehicleId: orderInput.vehicleId,
        vehicleName: orderInput.vehicleName,
        basePrice: orderInput.basePrice,
        deliveryPrice: orderInput.deliveryPrice,
        commission: orderInput.commission,
        gst: orderInput.gstAmount,
        distance: orderInput.distance,
        estimatedTime: orderInput.estimatedTime,
        deliveryType: orderInput.deliveryType,
        paymentMethod: orderInput.paymentMethod as PaymentMethod,
        paymentStatus:orderInput.paymentStatus as PaymentStatus,
        totalAmount: orderInput.price,
        status: OrderStatus.PENDING,
        pickupAddress: orderInput.pickupAddress,
        dropoffAddress: orderInput.dropoffAddress
      });

      return order;
    } catch (error) {
      console.error('Error in createOrder use case:', error);
      throw error;
    }
  }

  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    try {
      return await this.orderRepository.findAll();
    } catch (error) {
      console.error('Error in getAllOrders use case:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findById(id);
    } catch (error) {
      console.error(`Error in getOrderById use case for ID ${id}:`, error);
      throw error;
    }
  }

  // Get orders by user ID
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findByUserId(userId);
    } catch (error) {
      console.error(`Error in getOrdersByUserId use case for user ${userId}:`, error);
      throw error;
    }
  }

  // Get orders by user ID
  async getOrdersByDriversId(partnerId: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findByDriversId(partnerId);
    } catch (error) {
      console.error(`Error in getOrdersByDriversId use case for user ${partnerId}:`, error);
      throw error;
    }
  }

  // Update order
  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order | null> {
    try {
      return await this.orderRepository.update(id, orderData);
    } catch (error) {
      console.error(`Error in updateOrder use case for ID ${id}:`, error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(id: string, status: string, description?: string): Promise<Order | null> {
    try {
      return await this.orderRepository.updateStatus(id, status, description);
    } catch (error) {
      console.error(`Error in updateOrderStatus use case for ID ${id}:`, error);
      throw error;
    }
  }

  // Process payment
  async processPayment(paymentData: PaymentData): Promise<Order | null> {
    try {
      return await this.orderRepository.processPayment(paymentData);
    } catch (error) {
      console.error(`Error in processPayment use case for order ${paymentData.orderId}:`, error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(orderId: string): Promise<{
    orderId: string;
    paymentStatus: string;
    amount: number;
  } | null> {
    try {
      return await this.orderRepository.getPaymentStatus(orderId);
    } catch (error) {
      console.error(`Error in getPaymentStatus use case for order ${orderId}:`, error);
      throw error;
    }
  }

  // Process refund
  async processRefund(orderId: string): Promise<Order | null> {
    try {
      return await this.orderRepository.processRefund(orderId);
    } catch (error) {
      console.error(`Error in processRefund use case for order ${orderId}:`, error);
      throw error;
    }
  }

  // Delete order
  async deleteOrder(id: string): Promise<boolean> {
    try {
      return await this.orderRepository.delete(id);
    } catch (error) {
      console.error(`Error in deleteOrder use case for ID ${id}:`, error);
      throw error;
    }
  }
} 