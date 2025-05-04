import { User } from '../../domain/entities/user';

export interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
}

export interface UserResponse extends BaseResponse {
  user: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
    addresses?: string[];
    onlineStatus: boolean;
    isVerified: boolean;
    referralId?: string;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export interface UsersResponse extends BaseResponse {
  users: Array<{
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
    addresses?: string[];
    onlineStatus: boolean;
    isVerified: boolean;
    referralId?: string;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  page?: number;
  limit?: number;
}

export interface UpdateProfileResponse extends BaseResponse {
  user: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
    status: boolean;
    isVerified: boolean;
    referralId?: string;
    onlineStatus: boolean;
  };
}

export interface DeleteUserResponse extends BaseResponse {
  userId: string;
}

export interface UploadImageResponse extends BaseResponse {
  imageUrl: string;
}

export interface UserStatusResponse extends BaseResponse {
  userId: string;
  status: boolean;
}

export interface AddressResponse extends BaseResponse {
  address: {
    addressId: string;
    type: 'home' | 'work' | 'other';
    street: string;
    isDefault: boolean;
    userId: string;
    latitude?: number;
    longitude?: number;
    streetNumber?: string;
    buildingNumber?: string;
    floorNumber?: string;
    contactName?: string;
    contactPhone?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export interface AddressesResponse extends BaseResponse {
  addresses: Array<{
    addressId: string;
    type: 'home' | 'work' | 'other';
    street: string;
    isDefault: boolean;
    userId: string;
    latitude?: number;
    longitude?: number;
    streetNumber?: string;
    buildingNumber?: string;
    floorNumber?: string;
    contactName?: string;
    contactPhone?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
}

export interface DeleteAddressResponse extends BaseResponse {
  addressId: string;
} 