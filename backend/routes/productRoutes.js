const express = require('express');
const { getPerfumes } = require('../models/product');

const router = express.Router();

router.get('/perfumes', async (req, res) => {
    const perfumes = await getPerfumes();
    res.json(perfumes);
});

module.exports = router;
