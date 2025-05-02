const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET /api/men-scents
router.get('/', async (req, res) => {
  try {
    const menScents = await Product.getMenScents();
    res.json(menScents);
  } catch (error) {
    console.error('Error fetching men scents:', error);
    res.status(500).json({ error: 'Failed to fetch men scents data' });
  }
});

module.exports = router;
