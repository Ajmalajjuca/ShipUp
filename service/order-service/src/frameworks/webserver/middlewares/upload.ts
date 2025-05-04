import { Request, Response, NextFunction } from 'express';
import { uploadVehicleImage, getS3Url } from '../../storage/s3/config';

export const handleVehicleImageUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadVehicleImage(req, res, (err) => {
    if (err) {
      // Handle different types of errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File too large. Maximum size is 5MB'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }
    
    // Add image URL to request body if file was uploaded
    if (req.file) {
      // Use our custom function to get the S3 URL
      const s3File = req.file as Express.MulterS3.File;
      req.body.imageUrl = getS3Url(s3File);
    }
    
    next();
  });
}; 