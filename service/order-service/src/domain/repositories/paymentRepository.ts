// src/domain/repositories/paymentRepository.ts
import { PaymentEntity } from '../entities/payment';

export interface PaymentRepository {
  create(payment: PaymentEntity): Promise<void>;
  update(payment: PaymentEntity): Promise<void>;
}