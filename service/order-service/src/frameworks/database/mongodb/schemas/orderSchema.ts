import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus, TrackingStatus } from '../../../../domain/entities/Order';

// Define runtime enum for PaymentMethod
const PaymentMethodEnum = {
  STRIPE: 'stripe',
  WALLET: 'wallet',
  CASH: 'cash',
  UPI: 'upi'
} as const;

type PaymentMethod = typeof PaymentMethodEnum[keyof typeof PaymentMethodEnum];

// Address schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number }
}, { _id: false });

// Order item schema
const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  weight: { type: Number, required: true }
}, { _id: false });

// Vehicle schema
const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricePerKm: { type: Number, required: true },
  imageUrl: { type: String }
}, { _id: false });

// Shipping address schema
const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
}, { _id: false });

// Payment schema
const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['stripe', 'wallet', 'cash', 'upi'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'not_required', 'failed', 'refunded'],
    required: true 
  },
  transactionId: { type: String }
}, { _id: false });

// Tracking history item schema
const trackingHistoryItemSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true }
}, { _id: false });

// Tracking schema
const trackingSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: [
      'order_placed',
      'payment_confirmed',
      'payment_failed',
      'order_confirmed',
      'pickup_assigned',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'delivery_failed',
      'cancelled',
      'refund_processed'
    ],
    required: true 
  },
  history: { 
    type: [trackingHistoryItemSchema], 
    required: true,
    default: []
  }
}, { _id: false });

// Order schema
const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  vehicleId: { type: String, required: true },
  driverId: { type: String },
  vehicleName:{type:String, required:true},
  totalAmount: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  deliveryPrice: { type: Number, required: true },
  commission: { type: Number, required: true },
  gst: { type: Number, required: true },
  distance: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  deliveryType: { 
    type: String, 
    enum: ['normal', 'express'], 
    required: true 
  },
  paymentMethod: {
    type: String, 
    enum: Object.values(PaymentMethodEnum),
    required: true
  },
  paymentStatus:{
    type:String,
    enum:  ['pending', 'paid', 'not_required', 'failed', 'refunded'],
    require:true

  },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus),
    required: true,
    default: OrderStatus.PENDING
  },
  pickupAddress: { type: AddressSchema, required: true },
  dropoffAddress: { type: AddressSchema, required: true },
  payment: { type: paymentSchema },
  tracking: { type: trackingSchema },

}, 
{ 
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  } 
});

// Create indexes for improved query performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// Create the model
export const OrderModel = mongoose.model('Order', orderSchema); 