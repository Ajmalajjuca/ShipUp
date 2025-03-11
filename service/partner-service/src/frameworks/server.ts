import express from 'express';
import { driverController } from '../controllers/driverController';
import { connectDB } from './db';
import cors from 'cors'

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PATCH'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers
  }));
  
app.use(express.json());

connectDB();

app.post('/drivers/register', driverController.register);
app.get('/drivers', driverController.list);
app.patch('/drivers/status', driverController.updateStatus);

app.listen(3002, () => console.log('Partner Service running on port 3002'));