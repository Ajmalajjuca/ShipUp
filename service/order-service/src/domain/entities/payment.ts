// src/domain/entities/payment.ts
export interface Payment {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    stripePaymentIntentId?: string;
  }
  
  export class PaymentEntity {
    private payment: Payment;
  
    constructor(payment: Payment) {
      this.payment = payment;
    }
  
    public getOrderId(): string {
      return this.payment.orderId;
    }
  
    public getAmount(): number {
      return this.payment.amount;
    }
  
    public getCurrency(): string {
      return this.payment.currency;
    }
  
    public getStripePaymentIntentId(): string | undefined {
      return this.payment.stripePaymentIntentId;
    }
  }