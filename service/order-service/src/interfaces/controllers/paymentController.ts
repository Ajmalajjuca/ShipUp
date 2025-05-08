// src/interfaces/controllers/paymentController.ts
import { Request, Response } from 'express';
import { CreatePaymentIntentUseCase } from '../../application/use-cases/Payment/createPaymentIntent';
import { HandlePaymentStatusUseCase } from '../../application/use-cases/Payment/handlePaymentStatus';

export class PaymentController {
  constructor(
    private createPaymentIntentUseCase: CreatePaymentIntentUseCase,
    private handlePaymentStatusUseCase: HandlePaymentStatusUseCase
  ) {}

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, amount, currency } = req.body;
      if (!orderId || !amount || !currency) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = await this.createPaymentIntentUseCase.execute({
        orderId,
        amount,
        currency,
      });

      res.status(200).json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body;
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await this.handlePaymentStatusUseCase.execute({
          orderId: paymentIntent.metadata.orderId,
          paymentIntentId: paymentIntent.id,
          status: 'succeeded',
        });
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        await this.handlePaymentStatusUseCase.execute({
          orderId: paymentIntent.metadata.orderId,
          paymentIntentId: paymentIntent.id,
          status: 'failed',
        });
      }

      res.status(200).json({ received: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}