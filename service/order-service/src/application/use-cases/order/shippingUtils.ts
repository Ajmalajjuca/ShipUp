import { OrderItem } from '../../../domain/entities/Order';

// Constants for pricing and delivery calculations
const DEFAULT_PRICE_PER_KM = 15; // Default price per km if not specified by vehicle
const DEFAULT_MINIMUM_DISTANCE = 3; // Minimum distance in km for pricing
const COMMISSION_RATE = 0.05; // 5% commission
const GST_RATE = 0.18; // 18% GST
const DELIVERY_MULTIPLIERS = {
  normal: 1,    // Regular delivery (1x)
  express: 1.5  // Express delivery (1.5x)
};
const BASE_MINUTES_PER_KM = 5; // Base estimate of 5 minutes per km
const EXPRESS_TIME_MULTIPLIER = 0.7; // Express delivery is 30% faster

/**
 * Calculate shipping cost based on distance, vehicle type, and delivery type
 */
export const calculateShippingCost = async (
  distance: number,
  vehicleId: string,
  deliveryType: 'normal' | 'express',
  items: OrderItem[],
  vehicleInfo?: any
): Promise<{
  price: number;
  basePrice: number;
  deliveryPrice: number;
  commission: number;
  gstAmount: number;
  effectiveDistance: number;
}> => {
  try {
    // Use vehicle info if provided, or set defaults
    const pricePerKm = vehicleInfo?.pricePerKm || DEFAULT_PRICE_PER_KM;
    const minimumDistance = vehicleInfo?.minimumDistance || DEFAULT_MINIMUM_DISTANCE;
    
    // Calculate total weight
    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
    
    // Check if the vehicle can handle the weight (if vehicle info provided)
    if (vehicleInfo && vehicleInfo.maxWeight && totalWeight > vehicleInfo.maxWeight) {
      throw new Error(`Total weight exceeds vehicle capacity of ${vehicleInfo.maxWeight} kg`);
    }
    
    // Calculate effective distance (minimum distance or actual distance)
    const effectiveDistance = Math.max(distance, minimumDistance);
    
    // Calculate base price based on distance and vehicle price per km
    const basePrice = effectiveDistance * pricePerKm;
    
    // Calculate delivery price based on delivery type
    const deliveryMultiplier = DELIVERY_MULTIPLIERS[deliveryType];
    const deliveryPrice = basePrice * 0.1 * deliveryMultiplier;
    
    // Calculate commission (platform fee)
    const commission = basePrice * COMMISSION_RATE;
    
    // Calculate total price before tax
    const subtotal = basePrice + deliveryPrice + commission;
    
    // Calculate GST
    const gstAmount = subtotal * GST_RATE;
    
    // Calculate final price
    const price = subtotal + gstAmount;
    
    return {
      price: parseFloat(price.toFixed(2)),
      basePrice: parseFloat(basePrice.toFixed(2)),
      deliveryPrice: parseFloat(deliveryPrice.toFixed(2)),
      commission: parseFloat(commission.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      effectiveDistance
    };
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    throw error;
  }
};

/**
 * Estimate delivery time based on distance and delivery type
 */
export const estimateDeliveryTime = (
  distance: number,
  deliveryType: 'normal' | 'express',
  effectiveDistance: number
): string => {
  try {
    // Calculate base minutes for delivery
    const baseMinutes = effectiveDistance * BASE_MINUTES_PER_KM;
    
    // Apply delivery type modifier (express is faster)
    const timeMultiplier = deliveryType === 'express' ? EXPRESS_TIME_MULTIPLIER : 1;
    const estimatedMinutes = baseMinutes * timeMultiplier;
    
    // Format the estimated time
    if (estimatedMinutes < 60) {
      return `${Math.ceil(estimatedMinutes)} mins`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const mins = Math.ceil(estimatedMinutes % 60);
      return `${hours} hr${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} mins` : ''}`;
    }
  } catch (error) {
    console.error('Error estimating delivery time:', error);
    throw error;
  }
}; 