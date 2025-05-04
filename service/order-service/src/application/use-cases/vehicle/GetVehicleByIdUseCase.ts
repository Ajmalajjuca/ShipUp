import { VehicleRepository } from '../../../domain/repositories/VehicleRepository';
import { VehicleResultDTO } from '../../dtos/VehicleDTO';

export class GetVehicleByIdUseCase {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(id: string): Promise<VehicleResultDTO> {
    try {
      const vehicle = await this.vehicleRepository.findById(id);

      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      return {
        success: true,
        vehicle: {
          id: vehicle.id!,
          name: vehicle.name,
          description: vehicle.description || '',
          imageUrl: vehicle.imageUrl,
          isAvailable: vehicle.isAvailable,
          maxWeight: typeof vehicle.maxWeight === 'string' ? parseFloat(vehicle.maxWeight) || 0 : vehicle.maxWeight || 0,
          pricePerKm: vehicle.pricePerKm || 0,
          isActive: vehicle.isActive,
          createdAt: vehicle.createdAt.toISOString(),
          updatedAt: vehicle.updatedAt.toISOString()
        }
      };
    } catch (error) {
      console.error(`Error fetching vehicle with id ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch vehicle'
      };
    }
  }
} 