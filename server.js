require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db').default;
const redisClient = require('./config/redis');
const smsRoutes = require('./routes/smsRoutes');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');

// Load environment variables

// Initialize app
const app = express();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  
  
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use('/api', smsRoutes);
app.use('/api', authRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
