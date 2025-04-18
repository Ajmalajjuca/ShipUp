import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import { connectDB } from './infrastructure/database/mongoose';
import userRoutes from './presentation/routes/userRoutes';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(morgan('dev')); 
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Add all your frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'email', 'acl'],
    credentials: true
}));

// Database connection
connectDB();

// Routes
app.use('/api', userRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});

export default app;