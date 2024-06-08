import expressAsyncHandler from 'express-async-handler';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import multer from 'multer';
import sharp from 'sharp';

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const uploadLimit = 3;
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(req.files.length > uploadLimit || req.files.length === 0){
    cb(new Error(`You can upload a maximum of ${uploadLimit} images`), false);
  }else if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/* Upload User Photo */
export const uploadPhotos = upload.array('images', uploadLimit);

/* Resize User Photo */
export const resizePhotos = expressAsyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(); // Check if files exist

  const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString('hex');

  const resizedImages = await Promise.all(
    req.files.map(async (file) => {
      const buffer = await sharp(file.buffer).resize(350, 475).toBuffer();

      const filename = randomImageName();

      const params = {
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);

      await s3.send(command);

      return { filename, mimetype: file.mimetype };
    })
  );

  // Modify req.files with resized filenames
  req.files = resizedImages;

  next();
});
