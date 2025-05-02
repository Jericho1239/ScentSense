const express = require('express');
const router = express.Router();
const { getAllReviews, addReview } = require('../models/review');

// GET all reviews
router.get('/', (req, res) => {
    const reviews = getAllReviews();
    res.json(reviews);
});

// POST a new review
router.post('/', (req, res) => {
    const { username, email, text, date, product, rating } = req.body;
    if (!username || !email || !text || !date || !product || typeof rating !== 'number') {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    const review = { username, email, text, date, product, rating };
    addReview(review);
    res.status(201).json(review);
});

module.exports = router;
