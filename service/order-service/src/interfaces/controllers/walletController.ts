import { Request as BaseRequest, Response } from 'express';
import { AddMoneyUseCase } from '../../application/use-cases/wallet/add-money.usecase';
import { GetTransactionsUseCase } from '../../application/use-cases/wallet/get-transactions.usecase';
import { StripeService } from '../../domain/services/stripeService';
import { User } from '../../domain/entities/user';
import { StatusCode } from '../../types/StatusCode';


interface AuthRequest extends BaseRequest {
  user?: User;
}
export class WalletController {
  constructor(
    private addMoneyUseCase: AddMoneyUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private paymentService: StripeService
  ) {}

async createPaymentIntent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amount, currency } = req.body;

    // Validate input
    if (!amount || amount <= 0 || !currency) {
      console.warn('Invalid payment intent request:', req.body);
      res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid amount or currency' });
      return;
    }

    // Minimum amount validation for INR (4167 paisa ≈ ₹41.67)
    if (currency.toLowerCase() === 'inr' && amount < 4167) {
      console.warn(`Amount too low: ${amount} paisa for ${currency}`);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Amount must be at least ₹41.67 (4167 paisa) for INR',
      });
      return;
    }

    const clientSecret = await this.paymentService.createPaymentIntent(req.body);
    console.info(`Payment intent created for amount: ${amount}`);
    res.json({ success: true, clientSecret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Failed to create payment intent: ${(error as Error).message}`,
    });
  }
}

  async addMoney(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        console.warn('User ID not found in request');
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { amount, paymentIntentId } = req.body;
      if (!amount || amount <= 0 || !paymentIntentId) {
        console.warn('Invalid add money request:', req.body);
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid amount or payment intent ID' });
        return;
      }

      await this.addMoneyUseCase.execute(userId, { amount, paymentIntentId }, req.body.token);
      console.info(`Money added for user: ${userId}, amount: ${amount}`);
      res.json({ success: true, message: 'Money added successfully' });
    } catch (error) {
      console.error('Error adding money:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to add money' });
    }
  }

  async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    const { userId } = req.params;    
    
    try {
      if (!userId) {
        console.warn('User ID not found in request');
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const transactions = await this.getTransactionsUseCase.execute(userId);
      console.info(`Fetched transactions for user: ${userId}`);
      res.json({ success: true, transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch transactions' });
    }
  }
}