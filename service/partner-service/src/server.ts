import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './infrastructure/database/mongoose';
import partnerRoutes from './presentation/routes/driverRoutes';
import cors from 'cors'; 

const app = express();

// Enable CORS for your frontend origin
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.use(express.json());

// Handle multipart/form-data for file uploads
import multer from 'multer';
const upload = multer({ dest: 'uploads/' }); // Temporary storage, adjust as needed
app.use(upload.any()); // Allow any files to be uploaded

connectDB();
app.use('/api', partnerRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Partner Service running on port ${PORT}`));