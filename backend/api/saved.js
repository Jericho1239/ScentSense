const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// --- IMPORTANT ---
// This code assumes you have authentication middleware (e.g., `authenticateToken`)
// applied *before* these routes in your main server file (app.js or server.js).
// This middleware should verify the 'Authorization: Bearer <token>' header
// and attach the user's information to `req.user` (e.g., `req.user = { id: 'user-id' }`).
// Without this middleware, these routes will not work correctly or securely.
// Example (in your main server file where you use this router):
// const authenticateToken = require('./middleware/auth'); // Your auth middleware
// const savedApiRoutes = require('./api/saved');
// app.use('/api/saved-scents', authenticateToken, savedApiRoutes); // Mount router with base path & auth

const savedScentsPath = path.join(__dirname, '../models/saved-scents.json');
// No longer need womenScentsPath as details come from frontend
// const womenScentsPath = path.join(__dirname, '../models/women-scent.json');

// Helper function to read saved scents safely
async function readSavedScents() {
  try {
    const data = await fs.readFile(savedScentsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return default structure
    if (error.code === 'ENOENT') {
      return { savedScents: [] };
    }
    console.error("Error reading saved scents file:", error);
    // Re-throw a more specific error or handle as needed
    throw new Error("Could not read saved scents data."); 
  }
}

// Helper function to write saved scents
async function writeSavedScents(data) {
  try {
    await fs.writeFile(savedScentsPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing saved scents file:", error);
    throw new Error("Could not write saved scents data.");
  }
}


// POST / - Save a scent for the logged-in user (mounted at /api/saved-scents)
router.post('/', async (req, res) => { 
  // Check if authentication middleware populated req.user with an ID
  if (!req.user || !req.user.id) {
    // Middleware should ideally handle this, but double-check
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    // Get details from frontend request body
    const { productId, name, brand, image, orderUrl, Price } = req.body;
    const userId = req.user.id; // Get ID from authenticated user

    // Basic validation of required fields
    if (!productId || !name || !brand) {
        return res.status(400).json({ success: false, message: 'Missing required scent details (productId, name, brand).' });
    }

    const savedScentsData = await readSavedScents();

    // Check if already saved by this user
    const existingSave = savedScentsData.savedScents.find(
      save => save.productId === productId && save.userId === userId
    );

    if (existingSave) {
      // Use 409 Conflict status code as expected by frontend
      return res.status(409).json({ success: false, message: 'Scent already saved' });
    }

    // Create the details object directly from request body
    const productDetails = {
        productId, // Include productId if needed for display consistency
        name,
        brand,
        image: image || '', // Use default/empty string if not provided
        orderUrl: orderUrl || '#', // Use default/empty string if not provided
        Price: Price || '0' // Include Price with default value
    };

    // Add the new saved scent record
    savedScentsData.savedScents.push({
      productId,
      userId,
      savedAt: new Date().toISOString(),
      productDetails // Store the details received from frontend
    });

    // Save the updated data back to the file
    await writeSavedScents(savedScentsData);

    // Respond with 201 Created status and the saved data
    res.status(201).json({ success: true, message: 'Scent saved successfully', savedScent: productDetails });

  } catch (error) {
    console.error('Error saving scent:', error);
    // Send a generic server error message
    res.status(500).json({ success: false, message: 'Internal server error while saving scent.' });
  }
});


// GET / - Get logged-in user's saved scents (mounted at /api/saved-scents)
router.get('/', async (req, res) => { 
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const userId = req.user.id; // Get ID from authenticated user
    const savedScentsData = await readSavedScents();

    // Filter scents for the specific user
    const userSavedScents = savedScentsData.savedScents
      .filter(save => save.userId === userId)
      .map(save => ({
        ...save.productDetails,
        productId: save.productId,
        savedAt: save.savedAt
      })); // Include all product details and metadata

    // Respond directly with the array of saved scent details
    res.json(userSavedScents); 

  } catch (error) {
    console.error('Error fetching saved scents:', error);
    res.status(500).json({ success: false, message: 'Internal server error while fetching saved scents.' });
  }
});


// DELETE /:productId - Remove a scent for the logged-in user (mounted at /api/saved-scents/:productId)
router.delete('/:productId', async (req, res) => { 
   if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const { productId } = req.params; // Get productId from URL parameter
    const userId = req.user.id; // Get ID from authenticated user

    if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const savedScentsData = await readSavedScents();
    const initialLength = savedScentsData.savedScents.length;

    // Filter out the scent to be deleted for this specific user
    savedScentsData.savedScents = savedScentsData.savedScents.filter(
        save => !(save.productId === productId && save.userId === userId)
    );

    // Check if any scent was actually removed for this user
    if (savedScentsData.savedScents.length === initialLength) {
      // Use 404 Not Found status code as expected by frontend
      return res.status(404).json({ success: false, message: 'Saved scent not found for this user' });
    }

    // Save the updated array back to the file
    await writeSavedScents(savedScentsData);

    // Respond with 204 No Content (standard success for DELETE)
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting scent:', error);
    res.status(500).json({ success: false, message: 'Internal server error while deleting scent.' });
  }
});

module.exports = router;
