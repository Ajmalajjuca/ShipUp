export enum ErrorCode {
  // General errors
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  
  // Driver/Partner errors
  DRIVER_NOT_FOUND = 'DRIVER_NOT_FOUND',
  DRIVER_EXISTS = 'DRIVER_EXISTS',
  DRIVER_ID_REQUIRED = 'DRIVER_ID_REQUIRED',
  DRIVER_ID_INVALID = 'DRIVER_ID_INVALID',
  
  // File upload errors
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_TYPE_INVALID = 'FILE_TYPE_INVALID',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',
  FILE_MISSING = 'FILE_MISSING',
  
  // Auth validation errors
  AUTH_HEADER_REQUIRED = 'AUTH_HEADER_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Input validation errors
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  
  // Document errors
  DOCUMENT_VALIDATION_FAILED = 'DOCUMENT_VALIDATION_FAILED',
  DOCUMENT_UPLOAD_FAILED = 'DOCUMENT_UPLOAD_FAILED',
  
  // Vehicle errors
  INVALID_VEHICLE_TYPE = 'INVALID_VEHICLE_TYPE',
  INVALID_REGISTRATION_NUMBER = 'INVALID_REGISTRATION_NUMBER',
  
  // Bank details errors
  INVALID_ACCOUNT_NUMBER = 'INVALID_ACCOUNT_NUMBER',
  INVALID_IFSC_CODE = 'INVALID_IFSC_CODE',
  INVALID_UPI_ID = 'INVALID_UPI_ID'
} 