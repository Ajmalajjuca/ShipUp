import { Driver } from '../entities/driver';
import { DriverRepository } from '../repositories/driverRepository';

export class RegisterDriver {
  constructor(private driverRepo: DriverRepository) {}

  async execute(name: string, license: string) {
    const driver = new Driver(Date.now().toString(), name, license, 'pending');
    return await this.driverRepo.save(driver);
  }
}