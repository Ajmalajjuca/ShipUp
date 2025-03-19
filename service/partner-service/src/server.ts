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
app.use('/uploads/documents/aadhar', express.static(path.join(__dirname, '../uploads/documents/aadhar')));
app.use('/uploads/documents/pan', express.static(path.join(__dirname, '../uploads/documents/pan')));
app.use('/uploads/documents/license', express.static(path.join(__dirname, '../uploads/documents/license')));
app.use('/uploads/documents/insuranceDoc', express.static(path.join(__dirname, '../uploads/documents/insuranceDoc')));
app.use('/uploads/documents/pollutionDoc', express.static(path.join(__dirname, '../uploads/documents/pollutionDoc')));
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