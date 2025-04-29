import { Request, Response, NextFunction } from 'express';
import { VehicleType } from '../../../domain/entities/Vehicle';

// Create an array of valid vehicle types
const VehicleTypeValues = ['BIKE', 'CAR', 'VAN', 'TRUCK'] as const;

export const validateCreateVehicle = (req: Request, res: Response, next: NextFunction) => {
  const { name, maxWeight, pricePerKm } = req.body;  
  
  // Basic validation for required fields
  if (!name) {
    res.status(400).json({
      success: false,
      message: 'Vehicle name is required'
    });
    return;
  }
  
  // Validate maxWeight if provided
  if (maxWeight !== undefined && (isNaN(Number(maxWeight)) || Number(maxWeight) <= 0)) {
    res.status(400).json({
      success: false,
      message: 'Max Weight must be a positive number'
    });
    return;
  }
  
  // Validate pricePerKm if provided
  if (pricePerKm !== undefined && (isNaN(Number(pricePerKm)) || Number(pricePerKm) <= 0)) {
    res.status(400).json({
      success: false,
      message: 'Price per kilometer must be a positive number'
    });
    return;
  }
  
  // Vehicle type validation
  if (req.body.vehicleType && !VehicleTypeValues.includes(req.body.vehicleType)) {
    res.status(400).json({
      success: false,
      message: 'Invalid vehicle type'
    });
    return;
  }
  
  next();
};

export const validateUpdateVehicle = (req: Request, res: Response, next: NextFunction) => {
  const { maxWeight, pricePerKm } = req.body;
  
  // Check if at least one field is provided
  if (Object.keys(req.body).length === 0 && !req.file) {
    res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
    return;
  }
  
  // Validate maxWeight if provided
  if (maxWeight !== undefined && (isNaN(Number(maxWeight)) || Number(maxWeight) <= 0)) {
    res.status(400).json({
      success: false,
      message: 'Max Weight must be a positive number'
    });
    return;
  }
  
  // Validate pricePerKm if provided
  if (pricePerKm !== undefined && (isNaN(Number(pricePerKm)) || Number(pricePerKm) <= 0)) {
    res.status(400).json({
      success: false,
      message: 'Price per kilometer must be a positive number'
    });
    return;
  }
  
  // Vehicle type validation
  if (req.body.vehicleType && !VehicleTypeValues.includes(req.body.vehicleType)) {
    res.status(400).json({
      success: false,
      message: 'Invalid vehicle type'
    });
    return;
  }
  
  next();
}; 