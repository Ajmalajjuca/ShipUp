import 'express';
import multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      // Any custom properties you want to add to the Request object
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