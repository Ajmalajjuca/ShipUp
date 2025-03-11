import { DriverRepository } from "../../repositories/driverRepository";

export class VerifyDriverUseCase {
  private driverRepository: DriverRepository;

  constructor(driverRepository: DriverRepository) {
    this.driverRepository = driverRepository;
  }

  async execute(email: string) {
    if (!email) {
      throw new Error("Email is required");
    }

    const driver = await this.driverRepository.findByEmail(email);

    if (!driver) {
      return { success: false, message: "Driver not found" };
    }

    return { success: true, message: "Driver found", data: driver };
  }
}
