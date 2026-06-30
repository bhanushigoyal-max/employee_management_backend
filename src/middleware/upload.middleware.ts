import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';
import { MESSAGES } from '../lang/messages';

import { s3Client } from '../services/aws.service';
import multerS3 from 'multer-s3';

// Configure Multer to stream file uploads directly to the AWS S3 bucket
const storage = multerS3({
  s3: s3Client,
  bucket: (process.env.AWS_BUCKET_NAME || 'mern-octal').trim().replace(/['"]/g, ''),
  metadata: (req, file, cb) => {
    // Attach field metadata to the S3 object
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    // Generate a unique file name using timestamp and random number
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Store files inside an 'uploads/' folder within the S3 bucket to keep it organized
    cb(null, `uploads/${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File Filter Configuration
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'profileImage') {
    // Only accept image files for profileImage
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(MESSAGES.UPLOAD.INVALID_IMAGE));
    }
  } else if (file.fieldname === 'resume') {
    // Accept PDF, DOC, DOCX for resume
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(MESSAGES.UPLOAD.INVALID_RESUME));
    }
  } else {
    cb(new Error(MESSAGES.UPLOAD.UNEXPECTED_FIELD));
  }
};

// Multer Upload Middleware
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
