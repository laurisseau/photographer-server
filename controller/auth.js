import expressAsyncHandler from 'express-async-handler';
import User from '../model/user.js';

export const signup = expressAsyncHandler(async (req, res, next) => {
  await User.create(req.body);
  return res.status(200).send({ message: 'User signed up.' });
});

