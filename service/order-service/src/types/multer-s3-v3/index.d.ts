declare module 'multer-s3-v3' {
  import { S3Client } from '@aws-sdk/client-s3';
  import { Request } from 'express';
  import { StorageEngine } from 'multer';

  interface S3Storage {
    (options: {
      s3: S3Client;
      bucket: string;
      acl?: string;
      contentType?: any;
      metadata?: (req: Request, file: Express.Multer.File, cb: (error: Error | null, metadata?: any) => void) => void;
      key?: (req: Request, file: Express.Multer.File, cb: (error: Error | null, key?: string) => void) => void;
    }): StorageEngine;

    AUTO_CONTENT_TYPE: (req: Request, file: Express.Multer.File, cb: (error: Error | null, contentType?: string) => void) => void;
  }

  const s3: S3Storage;
  export = s3;
} 