const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Verify MongoDB connection
if (mongoose.connection.readyState !== 1) {
  console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
}

const STATIC_PASSWORD = process.env.STATIC_PASSWORD;
if (!STATIC_PASSWORD) {
  console.error('Warning: STATIC_PASSWORD environment variable is not set');
}

router.post(
  '/add-phone-number',
  [
    body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, password } = req.body;
      console.log('Received phone number:', phoneNumber);
      console.log('Received password:', password);
      console.log('Static password:', STATIC_PASSWORD);

      if (password !== STATIC_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }

      // Save the phone number to the database
      const newUser = new User({ phoneNumber });
      await newUser.save();

      return res.status(200).json({ message: 'Phone number added successfully' });
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ 
        message: 'Server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Get all phone numbers
router.get('/phone-numbers', async (req, res) => {
  try {
    const users = await User.find({}, { phoneNumber: 1, _id: 0 });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    return res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete phone number
router.delete(
  '/delete-phone-number',
  [
    body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, password } = req.body;

      if (password !== STATIC_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).json({ message: 'Phone number not found' });
      }

      await User.deleteOne({ phoneNumber });
      return res.status(200).json({ message: 'Phone number deleted successfully' });
    } catch (error) {
      console.error('Error deleting phone number:', error);
      return res.status(500).json({ 
        message: 'Server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;