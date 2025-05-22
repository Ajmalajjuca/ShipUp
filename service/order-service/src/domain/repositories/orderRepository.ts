import { Order, OrderInput, PaymentMethod, PaymentStatus } from '../entities/Order';

export interface PaymentData {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
}

export interface OrderRepository {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findByDriversId(partnerId: string, page: number, limit: number, status?: string, search?: string): Promise<{ orders: Order[]; total: number }>;
  update(id: string, orderData: Partial<Order>): Promise<Order | null>;
  updateStatus(id: string, status: string, description?: string): Promise<Order | null>;
  processPayment(paymentData: PaymentData): Promise<Order | null>;
  getPaymentStatus(orderId: string): Promise<{
    orderId: string;
    paymentStatus: PaymentStatus;
    amount: number;
  } | null>;
  processRefund(orderId: string): Promise<Order | null>;
  delete(id: string): Promise<boolean>;
} 