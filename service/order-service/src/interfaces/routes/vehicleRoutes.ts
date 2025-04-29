import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { CreateVehicleUseCase } from '../../application/use-cases/vehicle/CreateVehicleUseCase';
import { GetVehicleByIdUseCase } from '../../application/use-cases/vehicle/GetVehicleByIdUseCase';
import { GetVehiclesUseCase } from '../../application/use-cases/vehicle/GetVehiclesUseCase';
import { UpdateVehicleUseCase } from '../../application/use-cases/vehicle/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../../application/use-cases/vehicle/DeleteVehicleUseCase';
import { ToggleVehicleStatusUseCase } from '../../application/use-cases/vehicle/ToggleVehicleStatusUseCase';
import { MongoVehicleRepository } from '../../frameworks/database/mongo/repositories/MongoVehicleRepository';
import { validateCreateVehicle, validateUpdateVehicle } from '../../frameworks/webserver/middlewares/validation';
import { handleVehicleImageUpload } from '../../frameworks/webserver/middlewares/upload';

export const configureVehicleRoutes = (router: Router) => {
  const vehicleRepository = new MongoVehicleRepository();
  
  // Initialize use cases
  const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepository);
  const getVehicleByIdUseCase = new GetVehicleByIdUseCase(vehicleRepository);
  const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository);
  const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepository);
  const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepository);
  const toggleVehicleStatusUseCase = new ToggleVehicleStatusUseCase(vehicleRepository);
  
  // Initialize controller
  const vehicleController = new VehicleController(
    createVehicleUseCase,
    getVehicleByIdUseCase,
    getVehiclesUseCase,
    updateVehicleUseCase,
    deleteVehicleUseCase,
    toggleVehicleStatusUseCase
  );
  
  // Define routes
  // Admin vehicle management endpoints
  
  // Image upload endpoint - must be placed before routes with :id parameter
  router.post('/admin/vehicles/upload', handleVehicleImageUpload, (req, res) => {
    if (req.file && req.body.imageUrl) {
      res.status(200).json({
        success: true,
        imageUrl: req.body.imageUrl
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }
  });
  
  router.post('/admin/vehicles', handleVehicleImageUpload, validateCreateVehicle, (req, res) => vehicleController.createVehicle(req, res));
  router.get('/admin/vehicles', (req, res) => vehicleController.getVehicles(req, res));
  router.get('/admin/vehicles/:id', (req, res) => vehicleController.getVehicleById(req, res));
  router.put('/admin/vehicles/:id', handleVehicleImageUpload, validateUpdateVehicle, (req, res) => vehicleController.updateVehicle(req, res));
  router.delete('/admin/vehicles/:id', (req, res) => vehicleController.deleteVehicle(req, res));
  router.patch('/admin/vehicles/:id/toggle-status', (req, res) => vehicleController.toggleVehicleStatus(req, res));

  // Public vehicle endpoints for frontends to consume
  router.get('/vehicles', (req, res) => vehicleController.getVehicles(req, res));
  router.get('/vehicles/:id', (req, res) => vehicleController.getVehicleById(req, res));
  
  return router;
}; 