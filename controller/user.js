import expressAsyncHandler from 'express-async-handler';

export const test = expressAsyncHandler(async (req, res, next) => {
  return res.status(200).send({ message: 'Success' });
});




/*
  MODELS
    USER
      {
        id: 0,
        username: Lo,
        password: ******,
      }
    PHOTOS
      {
        userId: 0,
        Photos: img1, img2, ...
      }
    ADMIN
      {
        id: 1,
        username: ADMIN,
        password: ******
      }
*/
