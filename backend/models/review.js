const fs = require('fs');
const path = require('path');

const reviewsFile = path.join(__dirname, 'reviews.json');

function getAllReviews() {
    if (!fs.existsSync(reviewsFile)) return [];
    const data = fs.readFileSync(reviewsFile, 'utf-8');
    return data ? JSON.parse(data) : [];
}

function addReview(review) {
    // Add support for star rating and product
    // (No schema enforcement, just save whatever is passed)
    const reviews = getAllReviews();
    reviews.unshift(review);
    fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));
    return review;
}

module.exports = { getAllReviews, addReview };
