const fs = require('fs');
const path = require('path');

function formatProduct(product) {
    // Ensure price is a string with 2 decimal places
    const price = typeof product.Price === 'number' ? 
        product.Price.toFixed(2) : 
        parseFloat(product.Price).toFixed(2);

    // Capitalize first letter of item_group_id
    const item_group_id = product.item_group_id.charAt(0).toUpperCase() + product.item_group_id.slice(1);

    return {
        ...product,
        Price: price,
        item_group_id
    };
}

function addProduct(product) {
    const { item_group_id } = product;
    const jsonFile = `${item_group_id.toLowerCase()}-scent.json`;
    const filePath = path.join(__dirname, '..', 'models', jsonFile);

    try {
        // Read existing products
        let products = [];
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            products = JSON.parse(data);
        }

        // Format and add new product
        const formattedProduct = formatProduct(product);
        products.push(formattedProduct);

        // Write back to file with proper formatting
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        return { success: true, message: 'Product added successfully', product: formattedProduct };
    } catch (error) {
        console.error('Error adding product:', error);
        return { success: false, message: 'Failed to add product' };
    }
}

module.exports = { addProduct };