import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import passport from 'passport'
import { OAuth2Client } from "google-auth-library";
import jwt from 'jsonwebtoken';

import { connectDB } from './infrastructure/database/mongoose';
import authRoutes from './presentation/routes/authRoutes';

const app = express();

// Ensure GOOGLE_CLIENT_ID is available
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('GOOGLE_CLIENT_ID is not defined in environment variables');
  process.exit(1);
}

// Initialize Google OAuth client
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET // Optional
});

export { client };

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