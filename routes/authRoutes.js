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
  '/auth',
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

module.exports = router;