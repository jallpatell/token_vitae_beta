const express = require('express');
const bodyParser = require('body-parser');
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

// Service and route placeholders (to be implemented)
const priceRouter = require('./routes/price');
const scheduleRouter = require('./routes/schedule');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Mount routes
app.use('/price', priceRouter);
app.use('/schedule', scheduleRouter);

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
