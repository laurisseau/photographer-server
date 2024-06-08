import express from 'express';
import { uploadUserPhotos } from '../controller/admin.js';
import {
  uploadPhotos,
  resizePhotos,
} from '../utils/uploadImage.js';

const adminRouter = express.Router();

adminRouter.post(
  '/uploadUserPhotos',
  uploadPhotos,
  resizePhotos,
  uploadUserPhotos
);

export default adminRouter;
