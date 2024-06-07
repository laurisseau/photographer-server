import expressAsyncHandler from 'express-async-handler';

export const uploadUserPhotos = expressAsyncHandler(async (req, res, next) => {
  return res.status(200).send({ message: 'Admin upload' });
});