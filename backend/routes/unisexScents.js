const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET /api/unisex-scents
router.get('/', async (req, res) => {
  try {
    const unisexScents = await Product.getUnisexScents();
    res.json(unisexScents);
  } catch (error) {
    console.error('Error fetching unisex scents:', error);
    res.status(500).json({ error: 'Failed to fetch unisex scents data' });
  }
});

module.exports = router;
