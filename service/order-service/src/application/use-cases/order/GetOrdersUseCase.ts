import { OrderRepository } from '../../../domain/repositories/orderRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';

// Filter options for orders
export interface OrderFilterOptions {
  customerId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

// Response DTO for orders
export interface OrdersResponseDTO {
  success: boolean;
  message?: string;
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export class GetOrdersUseCase {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(filters?: OrderFilterOptions): Promise<OrdersResponseDTO> {
    try {
      const page = 1; // Pagination would be implemented in a real app
      const limit = 10;

      // Get orders from repository - this would use the filters in a real implementation
      const orders = await this.orderRepository.findAll();
      
      // Filter orders if needed (this would be done at the repository level in a real app)
      const filteredOrders = filters?.customerId 
        ? orders.filter(order => order.customerId === filters.customerId)
        : orders;
      
      const total = filteredOrders.length;

      // Return response DTO
      return {
        success: true,
        orders: filteredOrders,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        message: 'Failed to fetch orders',
        orders: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  }
} 