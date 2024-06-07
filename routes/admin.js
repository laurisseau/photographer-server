import express from 'express';
import { uploadUserPhotos } from '../controller/admin.js';

const adminRouter = express.Router();

adminRouter.get('/uploadUserPhotos', uploadUserPhotos);

export default adminRouter;