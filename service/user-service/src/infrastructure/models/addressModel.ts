import mongoose from 'mongoose';
import { Address } from '../../domain/entities/address';

const addressSchema = new mongoose.Schema<Address>({
  addressId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['home', 'work', 'other']
  },
  street: { 
    type: String, 
    required: true 
  },
  isDefault: { 
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  streetNumber: {
    type: String
  },
  buildingNumber: {
    type: String
  },
  floorNumber: {
    type: String
  },
  contactName: {
    type: String
  },
  contactPhone: {
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to update the updatedAt field
addressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const AddressModel = mongoose.model<Address>('Address', addressSchema); 