import { Request, Response } from 'express';
import { AddMoneyUseCase } from '../../application/use-cases/wallet/add-money.usecase';
import { GetTransactionsUseCase } from '../../application/use-cases/wallet/get-transactions.usecase';
import { StripeService } from '../../domain/services/stripeService';

export class WalletController {
  constructor(
    private addMoneyUseCase: AddMoneyUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private paymentService: StripeService
  ) {}

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency } = req.body;
      if (!amount || amount <= 0 || !currency) {
        console.warn('Invalid payment intent request:', req.body);
        res.status(400).json({ success: false, message: 'Invalid amount or currency' });
        return;
      }

      const clientSecret = await this.paymentService.createPaymentIntent(amount);
      //
      console.info(`Payment intent created for amount: ${amount}`);
      res.json({ success: true, clientSecret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
      res.status(500).json({ success: false, message: 'Failed to create payment intent' });
    }
  }

  async addMoney(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.warn('User ID not found in request');
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { amount, paymentIntentId } = req.body;
      if (!amount || amount <= 0 || !paymentIntentId) {
        console.warn('Invalid add money request:', req.body);
        res.status(400).json({ success: false, message: 'Invalid amount or payment intent ID' });
        return;
      }

      await this.addMoneyUseCase.execute(userId, { amount, paymentIntentId });
      console.info(`Money added for user: ${userId}, amount: ${amount}`);
      res.json({ success: true, message: 'Money added successfully' });
    } catch (error) {
      console.error('Error adding money:', error);
      res.status(500).json({ success: false, message: 'Failed to add money' });
    }
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.warn('User ID not found in request');
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const transactions = await this.getTransactionsUseCase.execute(userId);
      console.info(`Fetched transactions for user: ${userId}`);
      res.json({ success: true, transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
  }
}