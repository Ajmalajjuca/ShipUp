import { VehicleRepository, VehicleFilterOptions } from '../../../domain/repositories/VehicleRepository';
import { VehicleFilterDTO, VehiclesResponseDTO } from '../../dtos/VehicleDTO';

export class GetVehiclesUseCase {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(filters?: VehicleFilterDTO): Promise<VehiclesResponseDTO> {
    try {
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 10;

      // Convert DTO to domain filter
      const domainFilters: VehicleFilterOptions = {
        vehicleType: filters?.vehicleType,
        isAvailable: filters?.isAvailable,
        isActive: filters?.isActive,
        minCapacity: filters?.minCapacity,
        maxCapacity: filters?.maxCapacity
      };

      // Get vehicles from repository
      const vehicles = await this.vehicleRepository.findAll(domainFilters);
      const total = await this.vehicleRepository.getTotalCount(domainFilters);

      // Map to response DTO
      return {
        success: true,
        vehicles: vehicles.map(vehicle => ({
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
        })),
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return {
        success: false,
        message: 'Failed to fetch vehicles',
        vehicles: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  }
} 