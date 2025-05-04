import { Address } from '../../domain/entities/address';
import { AddressRepository } from '../../domain/repositories/addressRepository';
import { AddressModel } from '../models/addressModel';
import { v4 as uuidv4 } from 'uuid';

export class AddressRepositoryImpl implements AddressRepository {
  async create(address: Address): Promise<Address> {
    // Generate addressId if not provided
    if (!address.addressId) {
      address.addressId = uuidv4();
    }

    // If this is the default address, unset any existing default addresses for this user
    if (address.isDefault) {
      await AddressModel.updateMany(
        { userId: address.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const newAddress = new AddressModel(address);
    await newAddress.save();
    return newAddress.toObject();
  }

  async findById(addressId: string): Promise<Address | null> {
    const address = await AddressModel.findOne({ addressId });
    return address ? address.toObject() : null;
  }

  async update(addressId: string, data: Partial<Address>): Promise<Address | null> {
    // If updating to default, unset any existing default addresses for this user
    if (data.isDefault) {
      const currentAddress = await AddressModel.findOne({ addressId });
      if (currentAddress) {
        await AddressModel.updateMany(
          { userId: currentAddress.userId, isDefault: true },
          { isDefault: false }
        );
      }
    }

    const address = await AddressModel.findOneAndUpdate(
      { addressId },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    return address ? address.toObject() : null;
  }

  async delete(addressId: string): Promise<boolean> {
    const result = await AddressModel.deleteOne({ addressId });
    return result.deletedCount > 0;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const addresses = await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    return addresses.map(address => address.toObject());
  }

  async setDefault(userId: string, addressId: string): Promise<Address | null> {
    // First, unset any existing default addresses
    await AddressModel.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Set the specified address as default
    const address = await AddressModel.findOneAndUpdate(
      { addressId, userId },
      { isDefault: true, updatedAt: new Date() },
      { new: true }
    );
    return address ? address.toObject() : null;
  }
} 