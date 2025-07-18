import express from 'express';
import { fetchTokenPrice } from '../services/alchemy.js';

const router = express.Router();

// POST /history
router.post('/', async (req, res) => {
  const { token, network, timestamp } = req.body;
  if (!token || typeof token !== 'string' || !/^0x[a-fA-F0-9]{40,}$/.test(token)) {
    return res.status(400).json({ error: 'Valid token address required' });
  }
  if (!network || typeof network !== 'string') {
    return res.status(400).json({ error: 'Valid network required' });
  }
  if (!timestamp || isNaN(Number(timestamp))) {
    return res.status(400).json({ error: 'Valid timestamp required' });
  }
  try {
    // For demonstration, simulate 10 days of history ending at the given timestamp
    const ts = Math.floor(Number(timestamp));
    const history = [];
    for (let i = 9; i >= 0; i--) {
      const t = ts - i * 86400; // 86400 seconds in a day
      // Use mock Alchemy fetch (returns 1.23 for even timestamps, null for odd)
      const price = await fetchTokenPrice(token, network, t);
      if (price !== null) {
        history.push({ timestamp: t, price });
      }
    }
    res.json({ history });
  } catch (err) {
    console.error('Error in /history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 