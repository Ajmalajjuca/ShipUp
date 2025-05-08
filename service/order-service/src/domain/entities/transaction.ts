export interface Transaction {
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: Date;
  }