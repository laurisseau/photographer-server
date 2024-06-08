import expressAsyncHandler from 'express-async-handler';
import Photos from '../model/photos.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

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

export const getUserPhotos = expressAsyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const userPhotos = await Photos.findOne({ user: userId });

  if (!userPhotos) {
    return res.status(404).json({ error: 'User Id does not exist' });
  }

  const photoUrls = [];

  for (const photo of userPhotos.photos) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: photo,
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 30 });

    photoUrls.push(url);
  }

  console.log({ photos: photoUrls });
  return res.status(200).json({ photos: photoUrls });
});
