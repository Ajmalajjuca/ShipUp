import { VehicleType } from '../../domain/entities/Vehicle';

// Input DTOs
export interface CreateVehicleDTO {
  name: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  maxWeight?: string | number;
  pricePerKm?: number;
  isActive?: boolean;
}

export interface UpdateVehicleDTO {
  name?: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  maxWeight?: string | number;
  pricePerKm?: number;
  isActive?: boolean;
}

/**
 * Vehicle filter DTO for filtering vehicles in queries
 */
export interface VehicleFilterDTO {
  vehicleType?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  page?: number;
  limit?: number;
}

// Output DTOs
export interface VehicleResponseDTO {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  maxWeight: number;
  pricePerKm: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Vehicle entity as seen from the outside of the domain
 */
export interface VehicleDTO {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  maxWeight: number;
  pricePerKm: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response DTO for get vehicles use case
 */
export interface VehiclesResponseDTO {
  success: boolean;
  message?: string;
  vehicles: VehicleDTO[];
  total: number;
  page?: number;
  limit?: number;
}

export interface VehicleResultDTO {
  success: boolean;
  message?: string;
  vehicle?: VehicleResponseDTO;
} 