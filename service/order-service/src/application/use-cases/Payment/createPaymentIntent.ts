// src/application/useCases/createPaymentIntent.ts
import { OrderRepository } from '../../../domain/repositories/orderRepository';
import { OrderEntity } from '../../../domain/entities/Order';
import { StripeService } from '../../../domain/services/stripeService';

export interface CreatePaymentIntentInput {
  orderId: string;
  amount: number;
  currency: string;
}

export interface CreatePaymentIntentOutput {
  clientSecret: string;
  paymentIntentId: string;
}

export class CreatePaymentIntentUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private stripeService: StripeService
  ) {}

  async execute(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const orderEntity = new OrderEntity(order);
    console.log('paymentstatus===>',orderEntity.getPaymentStatus());
    
    if (orderEntity.getPaymentStatus() !== 'pending') {
      throw new Error('Order payment is not pending');
    }

    if (Math.round(orderEntity.getPrice() * 100) !== input.amount) {
      throw new Error('Invalid payment amount');
    }

    

    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: input.amount,
      currency: input.currency,
      metadata: { orderId: input.orderId },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
}