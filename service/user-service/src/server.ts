import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors'
import express from 'express';
import path from 'path';
import { connectDB } from './infrastructure/database/mongoose';
import userRoutes from './presentation/routes/userRoutes';

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: "GET,POST,PUT,DELETE", 
    allowedHeaders: "Content-Type, Authorization, email" ,
    credentials: true
}));

connectDB();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));