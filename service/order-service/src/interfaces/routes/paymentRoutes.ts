import express, { Router } from 'express';
import { PaymentController } from '../../interfaces/controllers/paymentController';
import { MongoOrderRepository } from '../../frameworks/database/mongodb/repositories/mongoOrderRepository';
import { StripeServiceImpl } from '../../infrastructure/services/stripeServiceImpl';
import { CreatePaymentIntentUseCase } from '../../application/use-cases/Payment/createPaymentIntent';
import { HandlePaymentStatusUseCase } from '../../application/use-cases/Payment/handlePaymentStatus';

export const configurePaymentRoutes = (router: Router) => {
  // Initialize dependencies
  const orderRepository = new MongoOrderRepository();
  const stripeService = new StripeServiceImpl();
  const createPaymentIntentUseCase = new CreatePaymentIntentUseCase(orderRepository, stripeService);
  const handlePaymentStatusUseCase = new HandlePaymentStatusUseCase(orderRepository);
  const paymentController = new PaymentController(createPaymentIntentUseCase, handlePaymentStatusUseCase);

  // Define routes
  // Create Stripe Payment Intent
  router.post('/stripe/create-payment-intent', (req, res) =>
    paymentController.createPaymentIntent(req, res)
  );

  // Stripe Webhook (raw body for signature verification)
  router.post(
    '/stripe/webhook',
    express.raw({ type: 'application/json' }),
    (req, res) => paymentController.handleWebhook(req, res)
  );

  return router;
};