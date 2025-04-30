export interface Address {
  street?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

export interface ActiveOrder {
  userId: string;
  orderId: string;
  driverId: string;
  pickupLocation: Address;
  dropLocation: Address;
  status: 'driver_assigned' | 'driver_arrived' | 'picked_up' | 'completed';
  timestamp: number;
  vehicle: string | null;
  pickupOtp: string;
  dropoffOtp?: string;
} 