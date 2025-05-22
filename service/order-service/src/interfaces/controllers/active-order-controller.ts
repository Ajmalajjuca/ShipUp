import { Request, Response } from 'express';
import { StoreActiveOrderUseCase } from '../../application/use-cases/active-order/StoreActiveOrderUseCase';
import { GetActiveOrderUseCase } from '../../application/use-cases/active-order/GetActiveOrderUseCase';
import { RemoveActiveOrderUseCase } from '../../application/use-cases/active-order/RemoveActiveOrderUseCase';
import { StatusCode } from '../../types/StatusCode';

export class ActiveOrderController {
  constructor(
    private storeActiveOrderUseCase: StoreActiveOrderUseCase,
    private getActiveOrderUseCase: GetActiveOrderUseCase,
    private removeActiveOrderUseCase: RemoveActiveOrderUseCase
  ) {}

  async storeActiveOrder(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const orderData = req.body;
      
      const ttl = req.body.ttl ? parseInt(req.body.ttl) : undefined;
      
      // Add userId to the order data
      orderData.userId = userId;
      
      await this.storeActiveOrderUseCase.execute(userId, orderData, ttl);
      
       res.status(StatusCode.CREATED).json({
        success: true,
        message: 'Active order stored successfully'
      });
      return;
    } catch (error: any) {
      console.error('Error in storeActiveOrder controller:', error);
       res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to store active order'
      });
      return;
    }
  }

  async getActiveOrder(req: Request, res: Response) {
    
    try {
      const { userId } = req.params;
      
      const activeOrder = await this.getActiveOrderUseCase.execute(userId);
      
      
       res.status(StatusCode.OK).json({
        success: true,
        data: activeOrder
      });
      return
    } catch (error: any) {
      console.error('Error in getActiveOrder controller:', error);
       res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to get active order'
      });
      return;
    }
  }

  async removeActiveOrder(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      await this.removeActiveOrderUseCase.execute(userId);
      
       res.status(StatusCode.OK).json({
        success: true,
        message: 'Active order removed successfully'
      });
      return;
    } catch (error: any) {
      console.error('Error in removeActiveOrder controller:', error);
       res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to remove active order'
      });
      return;
    }
  }
} 