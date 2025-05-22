import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './infrastructure/database/mongoose';
import userRoutes from './presentation/routes/userRoutes';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(morgan('dev')); 
app.use(express.json());


// Database connection
connectDB();

// Routes
app.use('/', userRoutes);

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