const fs = require('fs');
const path = require('path');

// Path to the JSON data files
const womenScentsPath = path.join(__dirname, 'women-scent.json');
const menScentsPath = path.join(__dirname, 'men-scent.json');
const unisexScentsPath = path.join(__dirname, 'unisex-scent.json');

// Product model
const Product = {
  // Find products based on a query
  find: async function(query) {
    try {
      // Load all scent data
      const womenScents = JSON.parse(fs.readFileSync(womenScentsPath, 'utf8'));
      const menScents = JSON.parse(fs.readFileSync(menScentsPath, 'utf8'));
      let unisexScents = [];
      
      // Try to load unisex scents if the file exists
      try {
        if (fs.existsSync(unisexScentsPath)) {
          unisexScents = JSON.parse(fs.readFileSync(unisexScentsPath, 'utf8'));
        }
      } catch (unisexError) {
        console.error('Error loading unisex scents:', unisexError);
        // Continue with empty unisex scents array
      }
      
      // Combine the data
      const allProducts = [...womenScents, ...menScents, ...unisexScents];
      
      // If there's no query, return all products
      if (!query) {
        return allProducts;
      }
      
      // Filter products based on the query
      // This example handles regex queries for the name field
      if (query.name && query.name.$regex) {
        const regex = new RegExp(query.name.$regex, query.name.$options || '');
        return allProducts.filter(product => 
          regex.test(product.Title) || 
          regex.test(product.Brand) || 
          regex.test(product.Description || '')
        );
      }
      
      // Handle other types of queries as needed
      return allProducts;
    } catch (error) {
      console.error('Error in Product.find:', error);
      throw error;
    }
  },
  
  // Get all women's scents
  getWomenScents: async function() {
    try {
      return JSON.parse(fs.readFileSync(womenScentsPath, 'utf8'));
    } catch (error) {
      console.error('Error loading women scents:', error);
      throw error;
    }
  },
  
  // Get all men's scents
  getMenScents: async function() {
    try {
      return JSON.parse(fs.readFileSync(menScentsPath, 'utf8'));
    } catch (error) {
      console.error('Error loading men scents:', error);
      throw error;
    }
  },
  
  // Get all unisex scents
  getUnisexScents: async function() {
    try {
      if (fs.existsSync(unisexScentsPath)) {
        return JSON.parse(fs.readFileSync(unisexScentsPath, 'utf8'));
      } else {
        console.warn('Unisex scents file does not exist yet');
        return [];
      }
    } catch (error) {
      console.error('Error loading unisex scents:', error);
      throw error;
    }
  }
};

module.exports = Product;
