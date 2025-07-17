const express = require('express');
const router = express.Router();

// GET /price
router.get('/', async (req, res) => {
  // For now, just echo back a placeholder response
  // TODO: Implement Redis cache, Alchemy fetch, and interpolation logic
  const { token, network, timestamp } = req.body;
  res.json({
    price: 0.9998,
    source: 'cache',
  });
});

module.exports = router; 