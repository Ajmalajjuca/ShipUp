import express from 'express';
import path from 'path';
import { routes } from './frameworks/webserver/routes';
import { errorHandler } from './frameworks/webserver/middlewares/error-handler';
import { connectDB, connectRedis } from './frameworks/database/connections';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

export const startServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3004;

  // Set up middleware
  app.use(morgan('dev')); // Logging middleware for development
  
  // Increase JSON payload size limit to 50MB
  app.use(express.json({ limit: '50mb' }));
  
  // Increase URL-encoded payload size limit to 50MB
  app.use(express.urlencoded({ 
    extended: true,
    limit: '50mb',
    parameterLimit: 50000 
  }));

  // Routes
  app.use('/', routes());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'order-service' });
  });

  // Error handling middleware
  app.use(errorHandler);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({ 
      success: false, 
      message: `Route ${req.originalUrl} not found` 
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Order service running on port ${PORT}`);
  });

  return app;
};

// Start the application
const start = async () => {
  try {
    await connectDB();
    await connectRedis();
    startServer();
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
};

// Run the application if this file is executed directly
if (require.main === module) {
  start();
}

