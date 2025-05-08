import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
}

const TransactionSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);