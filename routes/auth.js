const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// If database not connected, return 503 early to avoid long Mongoose buffering
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected. Please try again shortly.' });
  }
  next();
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      address: address || '',
      role: role || 'customer',
      isAdmin: role === 'admin'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Social login (development-friendly): accepts { provider, email, name }
router.post('/social', async (req, res) => {
  try {
    const { provider, email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Create a lightweight user for social login. phone and password required by schema,
      // use placeholders so app flows work in demo mode.
      const randomPassword = Math.random().toString(36).slice(-8) + Date.now();
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        password: randomPassword,
        phone: '0000000000',
        role: 'customer'
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.json({ message: 'Social login successful', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

