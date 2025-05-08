// Order payment methods
export type PaymentMethod = 'stripe' | 'wallet' | 'cash' | 'upi';

// Order payment status
export type PaymentStatus = 'pending' | 'paid' | 'not_required' | 'failed' | 'refunded';

// Order status
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Tracking status
export type TrackingStatus = 
  'order_placed' | 
  'payment_confirmed' | 
  'payment_failed' | 
  'order_confirmed' | 
  'pickup_assigned' |
  'picked_up' | 
  'in_transit' | 
  'out_for_delivery' | 
  'delivered' | 
  'delivery_failed' |
  'cancelled' |
  'refund_processed';

// Address interface
export interface Address {
  street: string;
  latitude?: number;
  longitude?: number;
}

// Order item interface
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  weight: number;
}

// Vehicle details in order
export interface OrderVehicle {
  id: string;
  name: string;
  type: string;
  pricePerKm: number;
  imageUrl?: string;
}

// Payment details
export interface Payment {
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
}

// Tracking history item
export interface TrackingHistoryItem {
  status: string;
  timestamp: Date;
  description: string;
}

// Order tracking
export interface Tracking {
  status: TrackingStatus;
  history: TrackingHistoryItem[];
}

// Order entity
export interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  driverId?: string; 
  status: OrderStatus;
  vehicleId: string;
  vehicleName: string;
  basePrice: number;
  deliveryPrice: number;
  commission: number;
  gst: number;
  distance: number;
  estimatedTime: number;
  deliveryType: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  pickupAddress: Address;
  dropoffAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

// Order input for creation
export interface OrderInput {
  userId: string;
  vehicleId: string;
  pickupAddress: Address;
  dropoffAddress: Address;
  items: OrderItem[];
  distance: number;
  deliveryType: 'normal' | 'express';
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
} 

export class OrderEntity {
  private order: Order;

  constructor(order: Order) {
    this.order = order;
  }

  public getOrderId(): string {
    return this.order.id;
  }

  public getPrice(): number {
    return this.order.totalAmount;
  }

  public getPaymentStatus(): string {
    console.log('entyty===>',this.order);
    
    return this.order.paymentStatus;
  }

  public updatePaymentStatus(status: 'pending' | 'paid' | 'not_required' | 'failed' | 'refunded'): void {
    this.order.paymentStatus = status;
  }

  public toJSON(): Order {
    return this.order;
  }
}