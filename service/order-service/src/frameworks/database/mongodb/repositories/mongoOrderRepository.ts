import mongoose from 'mongoose';
import { OrderRepository, PaymentData } from '../../../../domain/repositories/orderRepository';
import { Order, OrderStatus, PaymentStatus, TrackingStatus } from '../../../../domain/entities/Order';
import { OrderModel } from '../schemas/orderSchema';

export class MongoOrderRepository implements OrderRepository {
  private validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      // Create new order document
      const newOrder = new OrderModel({
        customerId: order.customerId,
        totalAmount: order.totalAmount,
        driverId: order.driverId,
        vehicleId: order.vehicleId,
        vehicleName: order.vehicleName,
        basePrice: order.basePrice,
        deliveryPrice: order.deliveryPrice,
        commission: order.commission,
        gst: order.gst,
        distance: order.distance,
        estimatedTime: order.estimatedTime,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status || OrderStatus.PENDING,
        pickupAddress: order.pickupAddress,
        dropoffAddress: order.dropoffAddress,
        
      });
      
      const savedOrder = await newOrder.save();

      // Convert to domain entity and return
      return this.mapToOrderEntity(savedOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Order | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    try {
      const order = await OrderModel.findById(id);
      return order ? this.mapToOrderEntity(order) : null;
    } catch (error) {
      console.error(`Error finding order with ID ${id}:`, error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Order[]> {
    try {
      const orders = await OrderModel.find({ customerId: userId }).sort({ createdAt: -1 });
      return orders.map(order => this.mapToOrderEntity(order));
    } catch (error) {
      console.error(`Error finding orders for user ${userId}:`, error);
      throw error;
    }
  }

async findByDriversId(
    partnerId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      const query: any = { driverId: partnerId };

      // Apply status filter
      if (status && status !== 'all' && this.validStatuses.includes(status)) {
        query.status = status;
      }

      // Apply search filter
      if (search) {
        query.$or = [
          { id: { $regex: search, $options: 'i' } },
          { 'pickupAddress.street': { $regex: search, $options: 'i' } },
          { 'dropoffAddress.street': { $regex: search, $options: 'i' } },
        ];
      }

      // Get total count
      const total = await OrderModel.countDocuments(query);

      // Get paginated orders
      let ordersQuery = OrderModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

      // Ensure only valid statuses are returned
      ordersQuery = ordersQuery.where('status').in(this.validStatuses);

      const orders = await ordersQuery.exec();

      return {
        orders: orders.map(order => this.mapToOrderEntity(order)),
        total,
      };
    } catch (error) {
      console.error(`Error finding orders for user ${partnerId}:`, error);
      throw error;
    }
  }



  async findAll(): Promise<Order[]> {
    try {
      const orders = await OrderModel.find().sort({ createdAt: -1 });
      return orders.map(order => this.mapToOrderEntity(order));
    } catch (error) {
      console.error('Error finding all orders:', error);
      throw error;
    }
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    try {
      // Convert customerId to userId for the MongoDB schema if it exists
      const mongoData: any = { ...orderData };
      
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        mongoData,
        { new: true }
      );
      
      return updatedOrder ? this.mapToOrderEntity(updatedOrder) : null;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  }

  async updateStatus(id: string, status: string, description?: string): Promise<Order | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    try {
      const order = await OrderModel.findById(id);
      
      if (!order) {
        return null;
      }
      
      // Update order status
      order.status = status;
      
      // Update tracking status and add to history if tracking exists
      if (order.tracking) {
        const tracking = order.tracking as any;
        tracking.status = status as TrackingStatus;
        tracking.history.push({
          status,
          timestamp: new Date(),
          description: description || `Order status updated to ${status}`
        });
      }
      
      await order.save();
      
      return this.mapToOrderEntity(order);
    } catch (error) {
      console.error(`Error updating status for order ${id}:`, error);
      throw error;
    }
  }

  async processPayment(paymentData: PaymentData): Promise<Order | null> {
    const { orderId, method, status, transactionId } = paymentData;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    
    try {
      const order = await OrderModel.findById(orderId);
      
      if (!order) {
        return null;
      }
      
      // Initialize payment if it doesn't exist
      if (!order.payment) {
        order.payment = {
          amount: paymentData.amount,
          method: paymentData.method,
          status: paymentData.status,
          transactionId: paymentData.transactionId
        } as any;
      } else {
        // Update payment information
        const payment = order.payment as any;
        payment.method = method;
        payment.status = status;
        payment.amount = paymentData.amount;
        
        if (transactionId) {
          payment.transactionId = transactionId;
        }
      }
      
      // Initialize tracking if it doesn't exist
      if (!order.tracking) {
        order.tracking = {
          status: 'order_placed',
          history: []
        } as any;
      }
      
      // Update order status based on payment status
      if (status === 'paid') {
        order.status = OrderStatus.PROCESSING;
        
        const tracking = order.tracking as any;
        tracking.status = 'payment_confirmed';
        tracking.history.push({
          status: 'payment_confirmed',
          timestamp: new Date(),
          description: 'Payment received and confirmed'
        });
      } else if (status === 'failed') {
        const tracking = order.tracking as any;
        tracking.history.push({
          status: 'payment_failed',
          timestamp: new Date(),
          description: 'Payment failed, please try again'
        });
      }
      
      await order.save();
      
      return this.mapToOrderEntity(order);
    } catch (error) {
      console.error(`Error processing payment for order ${orderId}:`, error);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string): Promise<{ orderId: string; paymentStatus: PaymentStatus; amount: number; } | null> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    
    try {
      const order = await OrderModel.findById(orderId);
      
      if (!order || !order.payment) {
        return null;
      }
      
      return {
        orderId: order._id.toString(),
        paymentStatus: (order.payment as any).status,
        amount: (order.payment as any).amount
      };
    } catch (error) {
      console.error(`Error getting payment status for order ${orderId}:`, error);
      throw error;
    }
  }

  async processRefund(orderId: string): Promise<Order | null> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    
    try {
      const order = await OrderModel.findById(orderId);
      
      if (!order || !order.payment) {
        return null;
      }
      
      // Check if payment was made
      if ((order.payment as any).status !== 'paid') {
        throw new Error('Cannot refund an unpaid order');
      }
      
      // Update payment status
      (order.payment as any).status = 'refunded';
      
      // Initialize tracking if it doesn't exist
      if (!order.tracking) {
        order.tracking = {
          status: 'refund_processed',
          history: []
        } as any;
      }
      
      // Update tracking information
      const tracking = order.tracking as any;
      tracking.status = 'refund_processed';
      tracking.history.push({
        status: 'refund_processed',
        timestamp: new Date(),
        description: 'Refund processed successfully'
      });
      
      order.status = OrderStatus.CANCELLED;
      
      await order.save();
      
      return this.mapToOrderEntity(order);
    } catch (error) {
      console.error(`Error processing refund for order ${orderId}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    try {
      const result = await OrderModel.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  }

  // Helper method to map MongoDB document to domain entity
  private mapToOrderEntity(document: any): Order {
  const order = document.toJSON ? document.toJSON() : document;

  return {
    id: order.id || order._id.toString(),
    customerId: order.customerId,
    driverId: order.driverId,
    status: this.validStatuses.includes(order.status) ? order.status : 'cancelled',
    totalAmount: order.totalAmount,
    vehicleId: order.vehicleId,
    vehicleName: order.vehicleName,
    basePrice: order.basePrice,
    deliveryPrice: order.deliveryPrice,
    commission: order.commission,
    gst: order.gst,
    distance: order.distance,
    estimatedTime: order.estimatedTime,
    deliveryType: order.deliveryType,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    pickupAddress: {
      street: order.pickupAddress.street,
      latitude: order.pickupAddress.latitude,
      longitude: order.pickupAddress.longitude,
    },
    dropoffAddress: {
      street: order.dropoffAddress.street,
      latitude: order.dropoffAddress.latitude,
      longitude: order.dropoffAddress.longitude,
    },
    createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
  };
}
} 