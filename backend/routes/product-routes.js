const express = require('express');
const router = express.Router();
const { addProduct } = require('../api/product-management');
const fs = require('fs');
const path = require('path');

// Add logging middleware
router.use((req, res, next) => {
    console.log('Product API Request:', {
        method: req.method,
        path: req.path,
        body: req.body
    });
    next();
});

router.post('/add-product', (req, res) => {
    try {
        // Validate required fields
        const requiredFields = [
            'id', 'item_group_id', 'Title', 'Description', 'Price',
            'Currency', 'Brand', 'Category', 'Type', 'URL', 'Size',
            'Status', 'ImagePath'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate item_group_id
        if (!['men', 'women', 'unisex', 'Men', 'Women', 'Unisex'].includes(req.body.item_group_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item_group_id. Must be one of: men, women, unisex'
            });
        }

        // Validate Status
        if (!['Luxury', 'Semi-expensive', 'Affordable'].includes(req.body.Status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Status. Must be one of: Luxury, Semi-expensive, Affordable'
            });
        }

        console.log('Adding product:', req.body);
        const result = addProduct(req.body);
        console.log('Add product result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error in add-product route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error: ' + error.message 
        });
    }
});

router.post('/update-product-page', (req, res) => {
    try {
        const { pageFile, productCard, productType } = req.body;
        const filePath = path.join(__dirname, '../../index', pageFile);

        let htmlContent = fs.readFileSync(filePath, 'utf8');

        const sectionTitle = productType.trim();

        // Match entire products block so we can inject before its </div>
        const sectionRegex = new RegExp(
            `(<h2>${sectionTitle}</h2>\\s*<div class="products">)([\\s\\S]*?)(</div>)`,
            'i'
        );

        if (!sectionRegex.test(htmlContent)) {
            // Section not found: create a new one
            const newSection = `
      <h2>${sectionTitle}</h2>
      <div class="products">
        ${productCard}
      </div>`;

            htmlContent = htmlContent.replace(
                '</section>',
                `${newSection}\n    </section>`
            );
        } else {
            // Prepend product inside the .products container (before existing products)
            htmlContent = htmlContent.replace(
                sectionRegex,
                (match, openingTag, productsContent, closingTag) => {
                    const updatedContent = `
        ${productCard}
${productsContent.trim()}
    `;

                    return `${openingTag}${updatedContent}${closingTag}`;
                }
            );
        }

        fs.writeFileSync(filePath, htmlContent, 'utf8');

        res.json({ success: true, message: 'Page updated successfully' });
    } catch (error) {
        console.error('Error updating product page:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product page: ' + error.message
        });
    }
});




module.exports = router;


