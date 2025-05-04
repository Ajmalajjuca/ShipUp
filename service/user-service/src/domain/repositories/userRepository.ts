import { User } from '../entities/user';

export interface UserRepository {
  /**
   * Creates a new user
   * @param user User data
   * @returns The created user
   */
  create(user: User): Promise<User>;
  
  /**
   * Finds a user by ID
   * @param userId User ID
   * @returns The user or null if not found
   */
  findById(userId: string): Promise<User | null>;
  
  /**
   * Finds a user by email
   * @param email User email
   * @returns The user or null if not found
   */
  findByEmail(email: string): Promise<User | null>;
  
  /**
   * Updates a user
   * @param userId User ID
   * @param data Updated user data
   * @returns The updated user
   */
  update(userId: string, data: Partial<User>): Promise<User | null>;
  
  /**
   * Deletes a user
   * @param userId User ID
   * @returns True if deleted successfully, false otherwise
   */
  delete(userId: string): Promise<boolean>;
  
  /**
   * Finds all users
   * @returns Array of users
   */
  findAll(): Promise<User[]>;
  
  /**
   * Finds a user by ID and updates it
   * @param userId User ID
   * @param updateData Updated user data
   * @returns The updated user or null if not found
   */
  findByIdAndUpdate(userId: string, updateData: Partial<User>): Promise<User | null>;
  
  /**
   * Updates user status
   * @param userId User ID
   * @param status New status
   * @returns The updated user or null if not found
   */
  updateStatus(userId: string, status: boolean): Promise<User | null>;
  
  /**
   * Updates user profile image
   * @param userId User ID
   * @param profileImage Profile image URL
   * @returns The updated user or null if not found
   */
  updateProfileImage(userId: string, profileImage: string): Promise<User | null>;
}