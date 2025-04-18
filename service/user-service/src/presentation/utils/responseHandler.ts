import { Response } from 'express';
import { StatusCode } from '../../types/enums/StatusCode';
import { ErrorMessage } from '../../types/enums/ErrorMessage';
import { ErrorCode } from '../../types/enums/ErrorCode';
import { BaseResponse } from '../../types/interfaces/responses';

export class ResponseHandler {
  static success(res: Response, data: any): void {
    res.status(StatusCode.OK).json({
      success: true,
      ...data
    });
  }

  static created(res: Response, data: any): void {
    res.status(StatusCode.CREATED).json({
      success: true,
      ...data
    });
  }

  static error(res: Response, message: string, statusCode: number = StatusCode.BAD_REQUEST, errorCode?: string, additionalData?: any): void {
    res.status(statusCode).json({
      success: false,
      error: message,
      errorCode,
      ...additionalData
    });
  }

  static validationError(res: Response, message: string = ErrorMessage.VALIDATION_ERROR, additionalData?: any): void {
    this.error(
      res,
      message,
      StatusCode.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      additionalData
    );
  }

  static unauthorized(res: Response, message: string = ErrorMessage.UNAUTHORIZED, errorCode?: string, additionalData?: any): void {
    this.error(
      res,
      message,
      StatusCode.UNAUTHORIZED,
      errorCode,
      additionalData
    );
  }

  static forbidden(res: Response, message: string = ErrorMessage.FORBIDDEN, errorCode?: string, additionalData?: any): void {
    this.error(
      res,
      message,
      StatusCode.FORBIDDEN,
      errorCode,
      additionalData
    );
  }

  static notFound(res: Response, message: string = ErrorMessage.NOT_FOUND, additionalData?: any): void {
    this.error(
      res,
      message,
      StatusCode.NOT_FOUND,
      ErrorCode.NOT_FOUND,
      additionalData
    );
  }

  static conflict(res: Response, message: string, errorCode?: string, additionalData?: any): void {
    this.error(
      res,
      message,
      StatusCode.CONFLICT,
      errorCode,
      additionalData
    );
  }

  static handleError(res: Response, error: any): void {
    console.error('Error:', error);
    
    // Check if it's a known error type
    if (error.status && error.message) {
      this.error(res, error.message, error.status, error.errorCode);
      return;
    }
    
    // Default to internal server error
    this.error(
      res, 
      ErrorMessage.INTERNAL_SERVER_ERROR,
      StatusCode.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVER_ERROR
    );
  }
} 