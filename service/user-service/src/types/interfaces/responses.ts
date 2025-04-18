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
    onlineStatus: boolean;
    isVerified: boolean;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
}

export interface UpdateProfileResponse extends BaseResponse {
  user: {
    userId: string;
    fullName?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    addresses?: string[];
    onlineStatus?: boolean;
    isVerified?: boolean;
    status?: boolean;
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