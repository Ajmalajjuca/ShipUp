import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { connectDB } from './infrastructure/database/mongoose';
import authRoutes from './presentation/routes/authRoutes';





const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: "GET,POST,PUT,DELETE", 
    allowedHeaders: "Content-Type, Authorization, email" 
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

connectDB();

// Use the routes
app.use('/auth', authRoutes);



app.listen(3001, () => console.log('Auth Service running on port 3001'));