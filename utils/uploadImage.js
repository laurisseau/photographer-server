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

const uploadLimit = 4;

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // Check if the number of uploaded files exceeds the upload limit
  // subtract the upload limit by 1 so the real limit is uploadLimit - 1
  if (req.files && req.files.length > uploadLimit - 1) {
    return cb(new Error(`You can upload 1 - ${uploadLimit - 1} images`), false);
  }

  if (file.mimetype.startsWith('image')) {
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
  if (!req.files || req.files.length === 0)
    return res
      .status(404)
      .send({ message: `You can upload 1 - ${uploadLimit - 1} images` });

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
