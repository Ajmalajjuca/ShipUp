import { Vehicle } from '../entities/Vehicle';

/**
 * Vehicle filter options for domain repository
 */
export interface VehicleFilterOptions {
  vehicleType?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
}

/**
 * Repository interface for vehicles
 */
export interface VehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findAll(filters?: VehicleFilterOptions): Promise<Vehicle[]>;
  update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null>;
  delete(id: string): Promise<boolean>;
  updateAvailability(id: string, isAvailable: boolean): Promise<Vehicle | null>;
  setActiveStatus(id: string, isActive: boolean): Promise<Vehicle | null>;
  setAvailability(id: string, isAvailable: boolean): Promise<Vehicle | null>;
  getTotalCount(filters?: VehicleFilterOptions): Promise<number>;
} 