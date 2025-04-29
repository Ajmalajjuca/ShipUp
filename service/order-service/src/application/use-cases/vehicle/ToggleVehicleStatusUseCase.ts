import { VehicleRepository } from '../../../domain/repositories/VehicleRepository';
import { VehicleResultDTO } from '../../dtos/VehicleDTO';

export class ToggleVehicleStatusUseCase {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(id: string): Promise<VehicleResultDTO> {
    try {
      // Check if vehicle exists
      const vehicle = await this.vehicleRepository.findById(id);
      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      // Toggle the active status using domain method
      const updatedVehicle = vehicle.toggleActiveStatus();
      
      // Save to repository
      const result = await this.vehicleRepository.setActiveStatus(id, updatedVehicle.isActive);
      
      if (!result) {
        return {
          success: false,
          message: 'Failed to update vehicle status'
        };
      }

      return {
        success: true,
        message: `Vehicle ${result.isActive ? 'activated' : 'deactivated'} successfully`,
        vehicle: {
          id: result.id!,
          name: result.name,
          description: result.description || '',
          imageUrl: result.imageUrl,
          isAvailable: result.isAvailable,
          maxWeight: typeof result.maxWeight === 'string' ? parseFloat(result.maxWeight) || 0 : result.maxWeight || 0,
          pricePerKm: result.pricePerKm || 0,
          isActive: result.isActive,
          createdAt: result.createdAt.toISOString(),
          updatedAt: result.updatedAt.toISOString()
        }
      };
    } catch (error) {
      console.error(`Error toggling vehicle status for id ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update vehicle status'
      };
    }
  }
} 