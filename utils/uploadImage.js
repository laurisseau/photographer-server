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

const uploadLimit = 501;

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
  if (!req.files || req.files.length === 0) {
    return res
      .status(404)
      .send({ message: `You can upload 1 - ${uploadLimit - 1} images` });
  }

  const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString('hex');

  const resizedImages = await Promise.all(
    req.files.map(async (file) => {

      const metadata = await sharp(file.buffer).metadata();
      const newWidth = Math.round(metadata.width * 0.8); // 80% of original width
      const newHeight = Math.round(metadata.height * 0.8); // 80% of original height

      let buffer = await sharp(file.buffer)
        .resize({ width: newWidth, height: newHeight })
        .toBuffer();

      const mimetype = file.mimetype;
      const format = mimetype.split('/')[1];

      // Apply format-specific transformations
      const image = sharp(buffer);
      if (format === 'webp') {
        buffer = await image.webp({ quality: 80 }).toBuffer();
      } else if (format === 'png') {
        buffer = await image.png({ compressionLevel: 9 }).toBuffer(); // PNG quality is set by compression level
      } else {
        buffer = await image.jpeg({ quality: 70 }).toBuffer();
      }

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
