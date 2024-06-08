import express from 'express';
import { getUserPhotos } from '../controller/user.js';

const userRouter = express.Router();

userRouter.get('/getUserPhotos/:id', getUserPhotos);

export default userRouter;
