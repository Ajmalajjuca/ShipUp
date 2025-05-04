export interface CreateUserRequest {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  addresses?: string[];
  onlineStatus?: boolean;
  isVerified?: boolean;
  referralId?: string;
  status?: boolean;
  profileImage?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  addresses?: string[];
  onlineStatus?: boolean;
  isVerified?: boolean;
  status?: boolean;
  profileImage?: string;
}

export interface UpdateUserStatusRequest {
  status: boolean;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  profileImage?: Express.Multer.File;
  profileImagePath?: string;
}

export interface GetUserByEmailRequest {
  email: string;
}

export interface AddAddressRequest {
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

export interface UpdateAddressRequest {
  addressId: string;
  type?: 'home' | 'work' | 'other';
  street?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
  streetNumber?: string;
  buildingNumber?: string;
  floorNumber?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface DeleteAddressRequest {
  addressId: string;
}

export interface SetDefaultAddressRequest {
  addressId: string;
} 