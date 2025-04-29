import { Request, Response } from 'express';
import { Order } from '../../domain/entities/Order';
import { PaymentData } from '../../domain/repositories/orderRepository';
import OrderUseCase, { CreateOrderDTO } from '../../application/use-cases/orderUseCase';
import { MongoOrderRepository } from '../../frameworks/database/mongodb/repositories/mongoOrderRepository';

export default class OrderController {
  private orderUseCase: OrderUseCase;

  constructor() {
    const orderRepository = new MongoOrderRepository();
    this.orderUseCase = new OrderUseCase(orderRepository);
  }

  createOrder = async (req: Request, res: Response) => {    
    try {
      const order = await this.orderUseCase.createOrder(req.body);
      res.status(201).json(order);
      return
    } catch (error) {
       res.status(500).json({ error: (error as Error).message });
       return
    }
  };

  getAllOrders = async (req: Request, res: Response) => {
    try {
      const orders = await this.orderUseCase.getAllOrders();
       res.status(200).json(orders);
       return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  getOrderById = async (req: Request, res: Response) => {
    try {
      const order = await this.orderUseCase.getOrderById(req.params.id);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return
      }
      res.status(200).json(order);
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  getOrdersByUserId = async (req: Request, res: Response) => {
    try {
      const orders = await this.orderUseCase.getOrdersByUserId(req.params.userId);
      res.status(200).json(orders);
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  updateOrder = async (req: Request, res: Response) => {
    try {
      const order = await this.orderUseCase.updateOrder(req.params.id, req.body);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return
      }
      res.status(200).json(order);
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { status, description } = req.body;
      const order = await this.orderUseCase.updateOrderStatus(req.params.id, status, description);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return
      }
      res.status(200).json(order);
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  processPayment = async (req: Request, res: Response) => {
    try {
      const paymentData: PaymentData = req.body;
      const order = await this.orderUseCase.processPayment(paymentData);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return
      }
      res.status(200).json(order);
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  getPaymentStatus = async (req: Request, res: Response) => {
    try {
      const paymentStatus = await this.orderUseCase.getPaymentStatus(req.params.orderId);
      if (!paymentStatus) {
        res.status(404).json({ message: 'Payment status not found' });
        return
      }
      res.status(200).json(paymentStatus);
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  processRefund = async (req: Request, res: Response) => {
    try {
      const order = await this.orderUseCase.processRefund(req.params.orderId);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return
      }
      res.status(200).json(order);
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };

  deleteOrder = async (req: Request, res: Response) => {
    try {
      const result = await this.orderUseCase.deleteOrder(req.params.id);
      if (!result) {
        res.status(404).json({ message: 'Order not found' });
        return
      }
      res.status(204).send();
      return
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return
    }
  };
}

export interface OrderControllerDependencies {
  createOrderUseCase: (orderInput: CreateOrderDTO) => Promise<Order>;
  getAllOrdersUseCase: () => Promise<Order[]>;
  getOrderByIdUseCase: (id: string) => Promise<Order | null>;
  getOrdersByUserIdUseCase: (userId: string) => Promise<Order[]>;
  updateOrderUseCase: (id: string, orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatusUseCase: (id: string, status: string, description?: string) => Promise<Order | null>;
  processPaymentUseCase: (paymentData: PaymentData) => Promise<Order | null>;
  getPaymentStatusUseCase: (orderId: string) => Promise<{
    orderId: string;
    paymentStatus: string;
    amount: number;
  } | null>;
  processRefundUseCase: (orderId: string) => Promise<Order | null>;
  deleteOrderUseCase: (id: string) => Promise<boolean>;
} 