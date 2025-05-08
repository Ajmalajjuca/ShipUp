import express, { Router } from 'express';
import { configureVehicleRoutes } from '../../../interfaces/routes/vehicleRoutes';
import { configureOrderRoutes } from '../../../interfaces/routes/orderRoutes';
import { configureActiveOrderRoutes } from '../../../interfaces/routes/activeOrderRoutes';
import { configurePaymentRoutes } from '../../../interfaces/routes/paymentRoutes';
import { configureWalletRoutes } from '../../../interfaces/routes/walletRoutes';

export const routes = () => {
  const router = express.Router();
  
  // Configure all route groups
  configureVehicleRoutes(router);
  configureOrderRoutes(router);
  configureActiveOrderRoutes(router);
  configurePaymentRoutes(router)
  configureWalletRoutes(router)

  
  return router;
}; 