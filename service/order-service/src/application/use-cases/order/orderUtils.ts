import { OrderItem } from '../../../domain/entities/Order';

/**
 * Calculate total amount for an order based on item prices and quantities
 */
export const calculateTotalAmount = (items: OrderItem[]): number => {
  const total = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Round to 2 decimal places
  return parseFloat(total.toFixed(2));
}; 