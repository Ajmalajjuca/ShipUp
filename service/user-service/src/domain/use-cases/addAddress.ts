import { Address } from '../entities/address';
import { AddressRepository } from '../repositories/addressRepository';
import { UserRepository } from '../repositories/userRepository';
import { v4 as uuidv4 } from 'uuid';

export class AddAddress {
  constructor(
    private addressRepo: AddressRepository,
    private userRepo: UserRepository
  ) {}

  async execute(
    userId: string,
    addressData: {
      type: 'home' | 'work' | 'other';
      street: string;
      isDefault?: boolean;
      latitude?: number;
      longitude?: number;
      streetNumber?: string;
      buildingNumber?: string;
      floorNumber?: string;
      contactName?: string;
      contactPhone?: string;
    }
  ): Promise<{ success: boolean; address?: Address; error?: string }> {
    try {
      // Check if user exists
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Create address object
      const addressId = uuidv4();
      const newAddress = new Address(
        addressId,
        addressData.type,
        addressData.street,
        addressData.isDefault || false,
        userId,
        addressData.latitude,
        addressData.longitude,
        addressData.streetNumber,
        addressData.buildingNumber,
        addressData.floorNumber,
        addressData.contactName,
        addressData.contactPhone,
        new Date(),
        new Date()
      );

      // Save address
      const savedAddress = await this.addressRepo.create(newAddress);

      return { success: true, address: savedAddress };
    } catch (error) {
      return { success: false, error: `Failed to add address: ${error}` };
    }
  }
}
