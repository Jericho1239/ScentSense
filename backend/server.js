require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');  

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product-routes');  
const reviewRoutes = require('./routes/reviewRoutes');
const savedScentsRoutes = require('./api/saved'); 
const authenticateToken = require('./middleware/auth');
const womenScentsRoute = require('./routes/womenScents');
const menScentsRoute = require('./routes/menScents');
const unisexScentsRoute = require('./routes/unisexScents');


// MongoDB Connection (Ensure MONGO_URI is set in .env)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Serve Static Folders
app.use(express.static(path.join(__dirname, '../index')));       // HTML Files
app.use(express.static(path.join(__dirname, '../design')));      // CSS Files
app.use(express.static(path.join(__dirname, '../functionality'))); // JavaScript Files
app.use(express.static(path.join(__dirname, '../images')));      // Image Files



// Serve Cover Page as Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index/coverpage.html'));
});

// Register API Routes
app.use('/auth', authRoutes);
app.use('/search', searchRoutes);
app.use('/api', productRoutes);  
app.use('/api/reviews', reviewRoutes);
app.use('/api/saved-scents', authenticateToken, savedScentsRoutes);
app.use('/api/women-scents', womenScentsRoute);
app.use('/api/men-scents', menScentsRoute);
app.use('/api/unisex-scents', unisexScentsRoute);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
