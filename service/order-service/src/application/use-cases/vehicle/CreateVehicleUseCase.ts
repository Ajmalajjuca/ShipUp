import { Vehicle } from '../../../domain/entities/Vehicle';
import { VehicleRepository } from '../../../domain/repositories/VehicleRepository';
import { CreateVehicleDTO, VehicleResultDTO } from '../../dtos/VehicleDTO';

export class CreateVehicleUseCase {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(vehicleData: CreateVehicleDTO): Promise<VehicleResultDTO> {
    try {
      // Create new Vehicle entity
      const vehicle = new Vehicle({
        name: vehicleData.name,
        description: vehicleData.description,
        imageUrl: vehicleData.imageUrl,
        isAvailable: vehicleData.isAvailable ?? true,
        maxWeight: vehicleData.maxWeight,
        pricePerKm: vehicleData.pricePerKm,
        isActive: vehicleData.isActive ?? true
      });

      // Save to repository
      const createdVehicle = await this.vehicleRepository.create(vehicle);

      return {
        success: true,
        message: 'Vehicle created successfully',
        vehicle: {
          id: createdVehicle.id!,
          name: createdVehicle.name,
          description: createdVehicle.description || '',
          imageUrl: createdVehicle.imageUrl,
          isAvailable: createdVehicle.isAvailable,
          maxWeight: typeof createdVehicle.maxWeight === 'string' ? parseFloat(createdVehicle.maxWeight) || 0 : createdVehicle.maxWeight || 0,
          pricePerKm: createdVehicle.pricePerKm || 0,
          isActive: createdVehicle.isActive,
          createdAt: createdVehicle.createdAt.toISOString(),
          updatedAt: createdVehicle.updatedAt.toISOString()
        }
      };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return {
        success: false,
        message: 'Failed to create vehicle'
      };
    }
  }
} 