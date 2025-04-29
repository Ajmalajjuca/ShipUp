import { VehicleRepository } from '../../../domain/repositories/VehicleRepository';

export interface DeleteVehicleResponse {
  success: boolean;
  message: string;
}

export class DeleteVehicleUseCase {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(id: string): Promise<DeleteVehicleResponse> {
    try {
      // Check if vehicle exists
      const vehicle = await this.vehicleRepository.findById(id);
      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      // This will soft delete the vehicle by setting isActive to false
      const deleted = await this.vehicleRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'Failed to delete vehicle'
        };
      }

      return {
        success: true,
        message: 'Vehicle deleted successfully'
      };
    } catch (error) {
      console.error(`Error deleting vehicle with id ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete vehicle'
      };
    }
  }
} 