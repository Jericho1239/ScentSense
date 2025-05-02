// Function to save order data
function saveOrder(productName, price) {
    // Get existing orders from localStorage or initialize empty array
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Create new order
    const order = {
        productId: generateProductId(productName),
        productName: productName,
        price: price,
        quantity: 1,
        orderDate: new Date().toISOString(),
        userId: localStorage.getItem('userId') || 'guest'
    };

    // Add new order to array
    orders.push(order);

    // Save back to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update order stats
    updateOrderStats();
}

// Function to generate a consistent product ID
function generateProductId(productName) {
    return productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Function to update order statistics
function updateOrderStats() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Calculate stats
    const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.price, 0),
        activeUsers: new Set(orders.map(order => order.userId)).size,
        productStats: {}
    };

    // Calculate per-product statistics
    orders.forEach(order => {
        if (!stats.productStats[order.productId]) {
            stats.productStats[order.productId] = {
                name: order.productName,
                orderCount: 0,
                revenue: 0,
                lastOrderDate: null
            };
        }

        const productStat = stats.productStats[order.productId];
        productStat.orderCount++;
        productStat.revenue += order.price;
        
        const orderDate = new Date(order.orderDate);
        if (!productStat.lastOrderDate || orderDate > new Date(productStat.lastOrderDate)) {
            productStat.lastOrderDate = order.orderDate;
        }
    });

    // Save stats to localStorage
    localStorage.setItem('orderStats', JSON.stringify(stats));
}
