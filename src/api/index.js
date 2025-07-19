import express from 'express';  
import bodyParser from 'body-parser';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';


// Service and route placeholders (to be implemented)
import priceRouter from './routes/price.js';
import scheduleRouter from './routes/schedule.js';
import historyRouter from './routes/history.js';
import { mongoose, connectMongo } from './services/mongoose.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;


connectMongo();
// Middleware
app.use(bodyParser.json());
app.use(cors())
// Mount routes
app.use('/price', priceRouter);
app.use('/schedule', scheduleRouter);
app.use('/history', historyRouter);

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
