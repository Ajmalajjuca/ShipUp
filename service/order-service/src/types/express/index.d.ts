import 'express';
import multer from 'multer';
import { User } from '../../domain/entities/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }

    // Add multer-s3 file interface
    namespace MulterS3 {
      interface File extends Multer.File {
        bucket: string;
        key: string;
        acl: string;
        contentType: string;
        contentDisposition: string;
        storageClass: string;
        serverSideEncryption: string;
        metadata: { [key: string]: string };
        location: string;
        etag: string;
      }
    }
  }
} 