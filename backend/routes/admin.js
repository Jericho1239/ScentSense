const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const router = express.Router();

// Admin credentials (in production, these should be in environment variables)
const ADMIN_USERNAME = 'Scentsense';
const ADMIN_PASSWORD = 'scentsenseproject';

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order statistics
router.get('/order-stats', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const orders = await Order.find({}).populate('user', 'username');
        
        // Calculate total orders and revenue
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Get unique active users who have placed orders
        const activeUsers = new Set(orders.map(order => order.user?.username)).size;

        // Calculate per-product statistics
        const productStats = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productStats[item.productId]) {
                    productStats[item.productId] = {
                        name: item.productName,
                        orderCount: 0,
                        revenue: 0,
                        lastOrderDate: null
                    };
                }
                
                const stats = productStats[item.productId];
                stats.orderCount += item.quantity;
                stats.revenue += item.price * item.quantity;
                
                const orderDate = new Date(order.orderDate);
                if (!stats.lastOrderDate || orderDate > stats.lastOrderDate) {
                    stats.lastOrderDate = orderDate;
                }
            });
        });

        res.json({
            totalOrders,
            totalRevenue,
            activeUsers,
            productStats: Object.values(productStats)
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
