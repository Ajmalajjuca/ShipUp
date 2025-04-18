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