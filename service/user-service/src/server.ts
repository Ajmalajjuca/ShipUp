import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './infrastructure/database/mongoose';
import userRoutes from './presentation/routes/userRoutes';

const app = express();
app.use(express.json());

connectDB();
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));