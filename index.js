import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { errors } from './controller/errors.js';
import userRouter from './routes/user.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';

const app = express();
dotenv.config();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user/', userRouter);
app.use('/api/admin/', adminRouter);
app.use('/api/auth/', authRouter);

app.use("/", (req, res,) => {
  return res.status(200).send({ message: 'Success' });
})

app.use(errors);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
