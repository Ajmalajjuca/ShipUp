// src/application/useCases/handlePaymentStatus.ts
import { OrderRepository } from '../../../domain/repositories/orderRepository';
import { Order, OrderEntity, PaymentStatus } from '../../../domain/entities/Order';

export interface HandlePaymentStatusInput {
  orderId: string;
  paymentIntentId: string;
  status: 'succeeded' | 'failed';
}

export class HandlePaymentStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(input: HandlePaymentStatusInput): Promise<void> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const orderEntity = new OrderEntity(order);
    if (input.status === 'succeeded') {
      orderEntity.updatePaymentStatus('paid');
    } else if (input.status === 'failed') {
      orderEntity.updatePaymentStatus('failed');
    }

    const orderId = orderEntity.getOrderId();
    const updatedOrderData: Partial<Order> = {
      paymentStatus: orderEntity.getPaymentStatus() as PaymentStatus,
    };

    const updatedOrder = await this.orderRepository.update(orderId, updatedOrderData);
    if (!updatedOrder) {
      throw new Error('Failed to update order');
    }
  }
}