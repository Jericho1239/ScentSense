const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET /search?q=searchTerm
router.get('/', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ message: 'No search term provided' });
    }

    // Using a case-insensitive regex search on the "name" field.
    const results = await Product.find({
      name: { $regex: searchTerm, $options: 'i' }
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
