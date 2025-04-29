import mongoose, { Document, Schema } from 'mongoose';
import { VehicleType } from '../../../../domain/entities/Vehicle';

export interface VehicleDocument extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  maxWeight?: string | number;
  pricePerKm?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<VehicleDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    maxWeight: {
      type: Schema.Types.Mixed
    },
    pricePerKm: {
      type: Number,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const VehicleModel = mongoose.model<VehicleDocument>('Vehicle', VehicleSchema);

export default VehicleModel; 