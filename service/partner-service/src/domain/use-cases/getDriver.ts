import { DriverRepository } from '../repositories/driverRepository';

export class GetDriver {
  constructor(private driverRepo: DriverRepository) {}

  async execute(partnerId: string): Promise<{ success: boolean; driver?: any; error?: string }> {
    const driver = await this.driverRepo.findById(partnerId);
    if (!driver) return { success: false, error: 'Driver not found' };
    return { success: true, driver };
  }
}