export interface StripePaymentIntent {
    id: string;
    client_secret: string;
  }
  
  export interface CreatePaymentIntentInput {
    amount: number;
    currency: string;
    metadata: { orderId: string };
  }
  
  export interface StripeService {
    createPaymentIntent(input: CreatePaymentIntentInput): Promise<StripePaymentIntent>;
  }