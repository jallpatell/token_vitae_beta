import express from 'express';
import redis from '../services/redis.js';
import Price from '../services/priceModel.js';
import { fetchTokenPrice } from '../services/alchemy.js';
import dotenv from 'dotenv';

dotenv.config();
// Helper: normalize timestamp to UTC seconds
function normalizeTimestamp(ts) {
  return Math.floor(Number(ts));
}

// Linear interpolation (matches user formula)
function interpolate(ts_q, ts_before, price_before, ts_after, price_after) {
  const ratio = (ts_q - ts_before) / (ts_after - ts_before);
  return price_before + (price_after - price_before) * ratio;
}

// --- Security Middleware ---
const rateLimiters = {};
const RATE_LIMIT = 30; // max requests per 60s per IP
const WINDOW_MS = 60 * 1000;

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

router.post('/', async (req, res) => {
  try {
    const { token, network, timestamp } = req.body;
    // Strict parameter validation
    if (!token || typeof token !== 'string' || !/^0x[a-fA-F0-9]{40,}$/.test(token)) {
      return res.status(400).json({ error: 'Valid token address required' });
    }
    if (!network || typeof network !== 'string') {
      return res.status(400).json({ error: 'Valid network required' });
    }
    if (!timestamp || isNaN(Number(timestamp))) {
      return res.status(400).json({ error: 'Valid timestamp required' });
    }
    const ts = normalizeTimestamp(timestamp);
    const cacheKey = `price:${token}:${network}:${ts}`;

    // 1. Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ price: parseFloat(cached), source: 'cache' });
    }

    // 2. Query Alchemy
    let price = null;
    try {
      price = await fetchTokenPrice(token, network, ts);
    } catch (e) {
      price = null;
    }
    if (price !== null && typeof price === 'number') {
      await Price.create({ token, network, date: ts, price, source: 'alchemy' });
      await redis.set(cacheKey, price, 'EX', 300);
      return res.json({ price, source: 'alchemy' });
    }

    // 3. Interpolation if price is missing
    const before = await Price.findOne({ token, network, date: { $lt: ts } }).sort({ date: -1 });
    const after = await Price.findOne({ token, network, date: { $gt: ts } }).sort({ date: 1 });

    if (before && after) {
      const interpolated = interpolate(ts, before.date, before.price, after.date, after.price);
      await Price.create({ token, network, date: ts, price: interpolated, source: 'interpolated' });
      await redis.set(cacheKey, interpolated, 'EX', 300);
      return res.json({ price: interpolated, source: 'interpolated' });
    } else if (before || after) {
      const best = before || after;
      await Price.create({ token, network, date: ts, price: best.price, source: 'approximate' });
      await redis.set(cacheKey, best.price, 'EX', 300);
      return res.json({ price: best.price, source: 'approximate' });
    } else {
      return res.status(404).json({ error: 'No price data available for the requested timestamp.' });
    }
  } catch (err) {
    console.error('Error in /price:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 