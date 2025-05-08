export interface TransactionDto {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
  }