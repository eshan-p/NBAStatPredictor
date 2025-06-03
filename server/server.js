const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const standingsRoutes = require('./routes/standings.js');

require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/standings', standingsRoutes);

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// API Routes (we'll add these later)
// app.use('/api/items', require('./routes/items'));

// Basic route
/*app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});*/

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});