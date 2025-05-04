import { Vehicle } from '../../../domain/entities/Vehicle';
import { VehicleRepository } from '../../../domain/repositories/VehicleRepository';
import { UpdateVehicleDTO, VehicleResultDTO } from '../../dtos/VehicleDTO';

export class UpdateVehicleUseCase {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(id: string, vehicleData: UpdateVehicleDTO): Promise<VehicleResultDTO> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.vehicleRepository.findById(id);
      if (!existingVehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      // If license plate is being updated, verify it's not already in use
      

      // Update vehicle using domain method
      const updatedVehicle = existingVehicle.updateDetails(vehicleData);
      
      // Save to repository
      const result = await this.vehicleRepository.update(id, updatedVehicle);
      
      if (!result) {
        return {
          success: false,
          message: 'Failed to update vehicle'
        };
      }

      return {
        success: true,
        message: 'Vehicle updated successfully',
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
      console.error(`Error updating vehicle with id ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update vehicle'
      };
    }
  }
} 