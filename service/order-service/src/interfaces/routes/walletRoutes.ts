import express, { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import { MongooseTransactionRepository } from '../../frameworks/database/mongo/repositories/transaction.repository';
import { HttpUserRepository } from '../../frameworks/database/mongo/repositories/user.repository';
import { StripeServiceImpl } from '../../infrastructure/services/stripeServiceImpl';
import { AddMoneyUseCase } from '../../application/use-cases/wallet/add-money.usecase';
import { GetTransactionsUseCase } from '../../application/use-cases/wallet/get-transactions.usecase';

export const configureWalletRoutes = (router: Router) => {
  // Initialize dependencies
  const transactionRepository = new MongooseTransactionRepository();
  const userRepository = new HttpUserRepository();
  const stripeService = new StripeServiceImpl();
  const addMoneyUseCase = new AddMoneyUseCase(transactionRepository, userRepository);
  const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);
  const walletController = new WalletController(addMoneyUseCase, getTransactionsUseCase, stripeService);

  // Define routes
  router.post('/wallet/stripe/create-payment-intent', (req, res) =>
    walletController.createPaymentIntent(req, res)
  );

  router.post('/wallet/add-money', (req, res) =>
    walletController.addMoney(req, res)
  );

  router.get('/wallet/transactions', (req, res) =>
    walletController.getTransactions(req, res)
  );

  return router;
};