import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './infrastructure/database/mongoose';
import partnerRoutes from './presentation/routes/driverRoutes';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Serve static files from different upload directories
app.use('/uploads/documents', express.static(path.join(__dirname, '../uploads/documents')));
app.use('/uploads/profile-images', express.static(path.join(__dirname, '../uploads/profile-images')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create upload directories if they don't exist
const uploadDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/documents'),
  path.join(__dirname, '../uploads/profile-images')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

connectDB();
app.use('/api', partnerRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Partner Service running on port ${PORT}`));