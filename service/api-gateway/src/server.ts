import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { configureRoutes } from './routes';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(morgan('dev'));


app.use('/', configureRoutes(express.Router()));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start Server
app.listen(config.port, () => {
  console.log(`API Gateway running on port ${config.port}`);
});