import express from 'express';
import { test } from '../controller/user.js';

const userRouter = express.Router();

userRouter.get('/', test);

export default userRouter;
