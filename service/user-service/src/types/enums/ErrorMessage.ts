export enum ErrorMessage {
  // General errors
  INTERNAL_SERVER_ERROR = 'Internal server error',
  VALIDATION_ERROR = 'Validation error',
  UNAUTHORIZED = 'Unauthorized access',
  FORBIDDEN = 'Access forbidden',
  NOT_FOUND = 'Resource not found',
  
  // User errors
  USER_NOT_FOUND = 'User not found',
  USER_EXISTS = 'User already exists',
  USER_ID_REQUIRED = 'User ID is required',
  USER_ID_INVALID = 'User ID is invalid',
  
  // File upload errors
  FILE_UPLOAD_ERROR = 'Error uploading file',
  FILE_TYPE_INVALID = 'Invalid file type',
  
  // Auth validation errors
  AUTH_HEADER_REQUIRED = 'Authorization header is required',
  PASSWORD_CHANGE_FAILED = 'Password change failed',
  CURRENT_PASSWORD_INCORRECT = 'Current password is incorrect',
  NEW_PASSWORD_INVALID = 'New password is invalid',
  
  // Input validation errors
  MISSING_REQUIRED_FIELDS = 'Missing required fields',
  INVALID_EMAIL_FORMAT = 'Invalid email format',
  INVALID_PHONE_FORMAT = 'Invalid phone number format',
  
  // Success messages
  USER_CREATED = 'User created successfully',
  USER_UPDATED = 'User updated successfully',
  USER_DELETED = 'User deleted successfully',
  PROFILE_UPDATED = 'Profile updated successfully',
  STATUS_UPDATED = 'Status updated successfully',
} 