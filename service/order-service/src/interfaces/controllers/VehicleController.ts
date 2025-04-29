import { Request, Response } from 'express';
import { CreateVehicleUseCase } from '../../application/use-cases/vehicle/CreateVehicleUseCase';
import { GetVehicleByIdUseCase } from '../../application/use-cases/vehicle/GetVehicleByIdUseCase';
import { GetVehiclesUseCase } from '../../application/use-cases/vehicle/GetVehiclesUseCase';
import { UpdateVehicleUseCase } from '../../application/use-cases/vehicle/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../../application/use-cases/vehicle/DeleteVehicleUseCase';
import { ToggleVehicleStatusUseCase } from '../../application/use-cases/vehicle/ToggleVehicleStatusUseCase';
import { CreateVehicleDTO, UpdateVehicleDTO, VehicleFilterDTO } from '../../application/dtos/VehicleDTO';
import { VehicleType } from '../../domain/entities/Vehicle';
import { deleteImageFromS3 } from '../../frameworks/storage/s3/config';

export class VehicleController {
  private createVehicleUseCase: CreateVehicleUseCase;
  private getVehicleByIdUseCase: GetVehicleByIdUseCase;
  private getVehiclesUseCase: GetVehiclesUseCase;
  private updateVehicleUseCase: UpdateVehicleUseCase;
  private deleteVehicleUseCase: DeleteVehicleUseCase;
  private toggleVehicleStatusUseCase: ToggleVehicleStatusUseCase;

  constructor(
    createVehicleUseCase: CreateVehicleUseCase,
    getVehicleByIdUseCase: GetVehicleByIdUseCase,
    getVehiclesUseCase: GetVehiclesUseCase,
    updateVehicleUseCase: UpdateVehicleUseCase,
    deleteVehicleUseCase: DeleteVehicleUseCase,
    toggleVehicleStatusUseCase: ToggleVehicleStatusUseCase
  ) {
    this.createVehicleUseCase = createVehicleUseCase;
    this.getVehicleByIdUseCase = getVehicleByIdUseCase;
    this.getVehiclesUseCase = getVehiclesUseCase;
    this.updateVehicleUseCase = updateVehicleUseCase;
    this.deleteVehicleUseCase = deleteVehicleUseCase;
    this.toggleVehicleStatusUseCase = toggleVehicleStatusUseCase;
  }

  async createVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicleData: CreateVehicleDTO = {
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl, // This comes from the S3 upload
        isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true,
        maxWeight: req.body.maxWeight,
        pricePerKm: req.body.pricePerKm !== undefined ? Number(req.body.pricePerKm) : undefined,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true
      };

      const result = await this.createVehicleUseCase.execute(vehicleData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        // If creation failed but we uploaded an image, we should delete it
        if (req.body.imageUrl) {
          await deleteImageFromS3(req.body.imageUrl);
        }
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createVehicle controller:', error);
      // Clean up the uploaded image if there was an error
      if (req.body.imageUrl) {
        await deleteImageFromS3(req.body.imageUrl);
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getVehicles(req: Request, res: Response): Promise<void> {
    try {
      const filters: VehicleFilterDTO = {};
      
      // Apply query parameters as filters
      if (req.query.vehicleType) {
        filters.vehicleType = req.query.vehicleType as VehicleType;
      }
      
      if (req.query.isAvailable !== undefined) {
        filters.isAvailable = req.query.isAvailable === 'true';
      }
      
      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
      }
      
      if (req.query.minCapacity) {
        filters.minCapacity = Number(req.query.minCapacity);
      }
      
      if (req.query.maxCapacity) {
        filters.maxCapacity = Number(req.query.maxCapacity);
      }
      
      if (req.query.page) {
        filters.page = Number(req.query.page);
      }
      
      if (req.query.limit) {
        filters.limit = Number(req.query.limit);
      }
      
      const result = await this.getVehiclesUseCase.execute(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getVehicles controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        vehicles: [],
        total: 0
      });
    }
  }

  async getVehicleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const result = await this.getVehicleByIdUseCase.execute(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error(`Error in getVehicleById controller for id ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // First get the existing vehicle to check if we need to remove old image
      const existingVehicle = await this.getVehicleByIdUseCase.execute(id);
      const oldImageUrl = existingVehicle.vehicle?.imageUrl;
      
      const vehicleData: UpdateVehicleDTO = {};
      
      // Only include fields that are provided in the request
      if (req.body.name !== undefined) vehicleData.name = req.body.name;
      if (req.body.description !== undefined) vehicleData.description = req.body.description;
      if (req.body.imageUrl !== undefined) vehicleData.imageUrl = req.body.imageUrl;
      if (req.body.isAvailable !== undefined) vehicleData.isAvailable = Boolean(req.body.isAvailable);
      if (req.body.maxWeight !== undefined) vehicleData.maxWeight = req.body.maxWeight;
      if (req.body.pricePerKm !== undefined) vehicleData.pricePerKm = Number(req.body.pricePerKm);
      if (req.body.isActive !== undefined) vehicleData.isActive = Boolean(req.body.isActive);
      
      const result = await this.updateVehicleUseCase.execute(id, vehicleData);
      
      if (result.success) {
        // If we uploaded a new image and there was an old one, delete the old one
        if (oldImageUrl && req.body.imageUrl && oldImageUrl !== req.body.imageUrl) {
          await deleteImageFromS3(oldImageUrl);
        }
        res.status(200).json(result);
      } else {
        // If update failed but we uploaded a new image, delete it
        if (req.body.imageUrl && req.body.imageUrl !== oldImageUrl) {
          await deleteImageFromS3(req.body.imageUrl);
        }
        res.status(404).json(result);
      }
    } catch (error) {
      console.error(`Error in updateVehicle controller for id ${req.params.id}:`, error);
      // Clean up the uploaded image if there was an error
      const existingVehicle = await this.getVehicleByIdUseCase.execute(req.params.id);
      if (req.body.imageUrl && req.body.imageUrl !== existingVehicle.vehicle?.imageUrl) {
        await deleteImageFromS3(req.body.imageUrl);
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async deleteVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Get the vehicle to find its image URL before deletion
      const vehicle = await this.getVehicleByIdUseCase.execute(id);
      const imageUrl = vehicle.vehicle?.imageUrl;
      
      const result = await this.deleteVehicleUseCase.execute(id);
      
      if (result.success && imageUrl) {
        // Delete the image from S3 if the vehicle was successfully deleted
        await deleteImageFromS3(imageUrl);
      }
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error(`Error in deleteVehicle controller for id ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async toggleVehicleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const result = await this.toggleVehicleStatusUseCase.execute(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error(`Error in toggleVehicleStatus controller for id ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
} 