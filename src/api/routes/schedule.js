import express from 'express';
import { scheduleQueue } from '../services/bullmq.js';
import dotenv from 'dotenv';

dotenv.config();
// --- Security Middleware ---
const rateLimiters = {};
const RATE_LIMIT = 10; // max requests per 60s per IP
const WINDOW_MS = 60 * 1000;



// ✅ scheduleQueue.js (keep this async IIFE)
(async () => {
  await scheduleQueue.add(
    'daily-fetcher',
    {},
    {
      repeat: {
        cron: '30 18 * * *',
        tz: 'Asia/Kolkata',
      },
      jobId: 'daily-fetcher-job',
    }
  );
})();



function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimiters[ip]) rateLimiters[ip] = [];
  rateLimiters[ip] = rateLimiters[ip].filter(ts => now - ts < WINDOW_MS);
  if (rateLimiters[ip].length >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  rateLimiters[ip].push(now);
  next();
}

function apiKeyCheck(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  next();
}

const router = express.Router();
router.use(rateLimiter);
router.use(apiKeyCheck);

// POST /schedule
router.post('/', async (req, res) => {
  // Strict parameter validation
  const { token, network } = req.body;
  if (!token || typeof token !== 'string' || !/^0x[a-fA-F0-9]{40,}$/.test(token)) {
    return res.status(400).json({ error: 'Valid token address required' });
  }
  if (!network || typeof network !== 'string') {
    return res.status(400).json({ error: 'Valid network required' });
  }
  try {
    // Add job to BullMQ queue
    const job = await scheduleQueue.add('fetch-history', { token, network });
    res.json({
      status: 'scheduled',
      token,
      network,
      jobId: job.id,
    });
  } catch (err) {
    console.error('Error scheduling job:', err);
    res.status(500).json({ error: 'Failed to schedule job' });
  }
});

export default router; 