// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure JWT_SECRET is loaded

const authMiddleware = (req, res, next) => {
    // Get token from header (Authorization: Bearer TOKEN)
    const authHeader = req.header('Authorization');

    // Check if not token
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if token is in the correct format 'Bearer <token>'
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token format is invalid (must be Bearer token)' });
    }

    const token = tokenParts[1];

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add user from payload (assuming payload has user id like { id: '...' })
        req.user = decoded; 
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Token verification error:', err.message); 
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
