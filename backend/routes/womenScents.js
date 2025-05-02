const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../models/women-scent.json');

  fs.readFile(filePath, 'utf8', (err, jsonData) => {
    if (err) {
      console.error('❌ Error reading women-scent.json:', err);
      return res.status(500).json({ error: 'Unable to load scent data' });
    }

    try {
      const data = JSON.parse(jsonData);
      res.json(data);
    } catch (parseErr) {
      console.error('❌ JSON parsing error:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

module.exports = router;
