import { OrderRepository } from '../../../domain/repositories/orderRepository';
import { Order } from '../../../domain/entities/Order';

// Response DTO for a single order
export interface OrderResponseDTO {
  success: boolean;
  message?: string;
  order?: Order;
}

export class GetOrderUseCase {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(id: string): Promise<OrderResponseDTO> {
    try {
      const order = await this.orderRepository.findById(id);
      
      if (!order) {
        return {
          success: false,
          message: `Order with ID ${id} not found`
        };
      }

      return {
        success: true,
        order
      };
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      return {
        success: false,
        message: `Failed to fetch order: ${(error as Error).message}`
      };
    }
  }
} 