import { Request, Response } from 'express';
import { RegisterDriver } from '../use-cases/registerDriver';
import { DriverRepository } from '../repositories/driverRepository';

const driverRepo = new DriverRepository();
const registerDriver = new RegisterDriver(driverRepo);

export const driverController = {
  register: async (req: Request, res: Response) => {
    const { name, license } = req.body;
    console.log(name,license);
    
    const driver = await registerDriver.execute(name, license);
    res.status(201).json(driver);
  },
  list: async (req: Request, res: Response) => {
    const drivers = await driverRepo.findAll();
    res.json(drivers);
  },
  updateStatus: async (req: Request, res: Response) => {
    const { id, status } = req.body;
    await driverRepo.updateStatus(id, status);
    res.status(200).send('Status updated');
  },
};