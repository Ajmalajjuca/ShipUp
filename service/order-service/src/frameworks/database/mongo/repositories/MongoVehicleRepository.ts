import { Vehicle, VehicleProps } from '../../../../domain/entities/Vehicle';
import { VehicleRepository, VehicleFilterOptions } from '../../../../domain/repositories/VehicleRepository';
import VehicleModel, { VehicleDocument } from '../models/VehicleModel';
import mongoose, { Document } from 'mongoose';

export class MongoVehicleRepository implements VehicleRepository {
  async create(vehicle: Vehicle): Promise<Vehicle> {
    const vehicleData = vehicle.toObject();
    const createdVehicle = await VehicleModel.create(vehicleData);
    
    return this.mapToVehicleEntity(createdVehicle);
  }

  async findById(id: string): Promise<Vehicle | null> {
    try {
      const vehicle = await VehicleModel.findById(id);
      
      if (!vehicle) {
        return null;
      }
      
      return this.mapToVehicleEntity(vehicle);
    } catch (error) {
      console.error(`Error finding vehicle with id ${id}:`, error);
      return null;
    }
  }

  async findAll(filters?: VehicleFilterOptions): Promise<Vehicle[]> {
    try {
      const query: any = {};
      
      // Apply filters if provided
      if (filters) {
        if (filters.vehicleType !== undefined) {
          query.vehicleType = filters.vehicleType;
        }
        
        if (filters.isAvailable !== undefined) {
          query.isAvailable = filters.isAvailable;
        }
        
        if (filters.isActive !== undefined) {
          query.isActive = filters.isActive;
        }
        
        if (filters.minCapacity !== undefined) {
          query.capacity = { $gte: filters.minCapacity };
        }
        
        if (filters.maxCapacity !== undefined) {
          query.capacity = {
            ...query.capacity,
            $lte: filters.maxCapacity
          };
        }
      }
      
      const vehicles = await VehicleModel.find(query);
      
      return vehicles.map(vehicle => this.mapToVehicleEntity(vehicle));
    } catch (error) {
      console.error('Error finding vehicles:', error);
      return [];
    }
  }

  async update(id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      // If vehicleData is a Vehicle instance, convert it to a plain object
      const updateData = vehicleData instanceof Vehicle 
        ? vehicleData.toObject() 
        : vehicleData;
      
      const vehicle = await VehicleModel.findByIdAndUpdate(
        id,
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          } 
        },
        { new: true }
      );
      
      if (!vehicle) {
        return null;
      }
      
      return this.mapToVehicleEntity(vehicle);
    } catch (error) {
      console.error(`Error updating vehicle with id ${id}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Soft delete - set isActive to false
      const result = await VehicleModel.findByIdAndUpdate(
        id,
        { 
          $set: { 
            isActive: false,
            updatedAt: new Date()
          } 
        }
      );
      
      return !!result;
    } catch (error) {
      console.error(`Error deleting vehicle with id ${id}:`, error);
      return false;
    }
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<Vehicle | null> {
    try {
      const vehicle = await VehicleModel.findByIdAndUpdate(
        id,
        { 
          $set: { 
            isActive,
            updatedAt: new Date()
          } 
        },
        { new: true }
      );
      
      if (!vehicle) {
        return null;
      }
      
      return this.mapToVehicleEntity(vehicle);
    } catch (error) {
      console.error(`Error setting active status for vehicle with id ${id}:`, error);
      return null;
    }
  }

  async setAvailability(id: string, isAvailable: boolean): Promise<Vehicle | null> {
    try {
      const vehicle = await VehicleModel.findByIdAndUpdate(
        id,
        { 
          $set: { 
            isAvailable,
            updatedAt: new Date()
          } 
        },
        { new: true }
      );
      
      if (!vehicle) {
        return null;
      }
      
      return this.mapToVehicleEntity(vehicle);
    } catch (error) {
      console.error(`Error setting availability for vehicle with id ${id}:`, error);
      return null;
    }
  }

  // This method is needed to match the VehicleRepository interface
  async updateAvailability(id: string, isAvailable: boolean): Promise<Vehicle | null> {
    // We can reuse the existing setAvailability method
    return this.setAvailability(id, isAvailable);
  }

  async getTotalCount(filters?: VehicleFilterOptions): Promise<number> {
    try {
      const query: any = {};
      
      // Apply filters if provided
      if (filters) {
        if (filters.vehicleType !== undefined) {
          query.vehicleType = filters.vehicleType;
        }
        
        if (filters.isAvailable !== undefined) {
          query.isAvailable = filters.isAvailable;
        }
        
        if (filters.isActive !== undefined) {
          query.isActive = filters.isActive;
        }
        
        if (filters.minCapacity !== undefined) {
          query.capacity = { $gte: filters.minCapacity };
        }
        
        if (filters.maxCapacity !== undefined) {
          query.capacity = {
            ...query.capacity,
            $lte: filters.maxCapacity
          };
        }
      }
      
      return await VehicleModel.countDocuments(query);
    } catch (error) {
      console.error('Error counting vehicles:', error);
      return 0;
    }
  }

  // Helper method to convert MongoDB document to domain entity
  private mapToVehicleEntity(vehicle: Document): Vehicle {
    return new Vehicle({
      id: vehicle.get('_id')?.toString() || vehicle.id,
      name: vehicle.get('name'),
      description: vehicle.get('description'),
      imageUrl: vehicle.get('imageUrl'),
      isAvailable: vehicle.get('isAvailable'),
      maxWeight: vehicle.get('maxWeight'),
      pricePerKm: vehicle.get('pricePerKm'),
      isActive: vehicle.get('isActive'),
      createdAt: vehicle.get('createdAt'),
      updatedAt: vehicle.get('updatedAt')
    });
  }
} 