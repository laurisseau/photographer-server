import expressAsyncHandler from 'express-async-handler';
import Photos from '../model/photos.js';

export const uploadUserPhotos = expressAsyncHandler(async (req, res, next) => {
  const userPhotos = req.files;
  const arrPhotos = [];

  for (const photo of userPhotos) {
    arrPhotos.push(photo.filename);
  }

  await Photos.create({ user: req.body.user, photos: arrPhotos });

  return res.status(200).send({ message: 'Admin uploaded images' });
});
