import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3-v3';
import path from 'path';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Request } from 'express';
import dotenv from 'dotenv';
dotenv.config();


// Configure AWS SDK
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-access-key',
  region: process.env.AWS_REGION || 'us-east-1',
  bucketName: process.env.AWS_PARTNER_BUCKET_NAME || 'shipup-vehicle-images'
};

// Initialize S3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
  region: s3Config.region
});

// Create multer-s3 storage
export const s3Storage = multerS3({
  s3: s3Client,
  bucket: s3Config.bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req: Request, file: Express.Multer.File, cb: (error: Error | null, key?: string) => void): void => {
    const fileName = `vehicle-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, `vehicles/${fileName}`);
  },
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  }
});

// Construct the S3 URL from the file information
export const getS3Url = (file: Express.MulterS3.File): string => {
  const region = s3Config.region;
  const bucket = s3Config.bucketName;
  const key = file.key;
  
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

// File filter function
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer upload instance
export const uploadVehicleImage = multer({
  storage: s3Storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  }
}).single('image'); // 'image' is the field name in form data

// Function to delete image from S3
export const deleteImageFromS3 = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract key from URL
    // For URLs like: https://bucket-name.s3.region.amazonaws.com/vehicles/image-name.jpg
    const urlParts = imageUrl.split('/');
    const key = `vehicles/${urlParts[urlParts.length - 1]}`;
    
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return false;
  }
}; 