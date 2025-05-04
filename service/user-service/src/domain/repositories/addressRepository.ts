import { Address } from '../entities/address';

export interface AddressRepository {
  /**
   * Creates a new address
   * @param address Address data
   * @returns The created address
   */
  create(address: Address): Promise<Address>;
  
  /**
   * Finds an address by ID
   * @param addressId Address ID
   * @returns The address or null if not found
   */
  findById(addressId: string): Promise<Address | null>;
  
  /**
   * Updates an address
   * @param addressId Address ID
   * @param data Updated address data
   * @returns The updated address
   */
  update(addressId: string, data: Partial<Address>): Promise<Address | null>;
  
  /**
   * Deletes an address
   * @param addressId Address ID
   * @returns True if deleted successfully, false otherwise
   */
  delete(addressId: string): Promise<boolean>;
  
  /**
   * Finds all addresses for a user
   * @param userId User ID
   * @returns Array of addresses
   */
  findByUserId(userId: string): Promise<Address[]>;
  
  /**
   * Sets an address as default for a user
   * @param userId User ID
   * @param addressId Address ID
   * @returns The updated address
   */
  setDefault(userId: string, addressId: string): Promise<Address | null>;
} 