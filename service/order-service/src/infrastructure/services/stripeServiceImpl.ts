// src/infrastructure/services/stripeServiceImpl.ts
import Stripe from 'stripe';
import { StripeService, StripePaymentIntent, CreatePaymentIntentInput } from '../../domain/services/stripeService';

export class StripeServiceImpl implements StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY||'', {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<StripePaymentIntent> {
    console.log('input===>',input);
    
    try {
      if (input.currency === 'inr' && input.amount < 5000) {
  throw new Error('Minimum payment amount for INR is ₹50 (5000 paise)');
}

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        metadata: input.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret!,
      };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      throw new Error(`Invalid request to Stripe: ${error.message}`);
    }
      throw new Error(`Failed to create Payment Intent: ${(error as Error).message}`);
    }
  }
}