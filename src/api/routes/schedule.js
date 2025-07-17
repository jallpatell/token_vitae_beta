const express = require('express');
const router = express.Router();

// POST /schedule
router.post('/', async (req, res) => {
  // For now, just echo back a placeholder response
  // TODO: Implement BullMQ job scheduling
  const { token, network } = req.body;
  res.json({
    status: 'scheduled',
    token,
    network,
  });
});

module.exports = router; 