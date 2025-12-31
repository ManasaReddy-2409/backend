const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const Category = require('../models/Category');
const authAdmin = require('../middleware/authAdmin');

// Admin login (only admin users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isAdmin) return res.status(403).json({ message: 'Not an admin' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '7d' });
    res.json({ message: 'Admin login successful', token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get users (admin protected)
router.get('/users', authAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200);
    const skip = (page - 1) * limit;
    const total = await User.countDocuments();
    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password');
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user (admin)
router.put('/users/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (admin)
router.delete('/users/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get dashboard stats
router.get('/stats', authAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
      const totalProviders = await ServiceProvider.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Category.countDocuments();
    const categories = await Category.find().limit(20);
    res.json({ totalUsers, totalProviders, totalBookings, totalCategories, categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Providers management
router.get('/providers', authAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200);
    const skip = (page - 1) * limit;
    const total = await ServiceProvider.countDocuments();
    const providers = await ServiceProvider.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ providers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

  // Get single provider
  router.get('/providers/:id', authAdmin, async (req, res) => {
    try {
      const provider = await ServiceProvider.findById(req.params.id);
      if (!provider) return res.status(404).json({ message: 'Provider not found' });
      res.json({ provider });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

router.put('/providers/:id', authAdmin, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json({ provider });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/providers/:id/verify', authAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    provider.verified = action === 'approve';
    await provider.save();
    res.json({ provider });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete provider
router.delete('/providers/:id', authAdmin, async (req, res) => {
  try {
    const prov = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!prov) return res.status(404).json({ message: 'Provider not found' });
    res.json({ message: 'Provider deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Categories management
router.get('/categories', authAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    // compute provider counts per category (case-insensitive)
    const providers = await ServiceProvider.find().select('serviceCategory').lean();
    const counts = {};
    providers.forEach((p) => {
      if (!p.serviceCategory) return;
      const key = p.serviceCategory.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });

    const categoriesWithCounts = categories.map((c) => {
      const key = (c.name || '').toLowerCase();
      return Object.assign({}, c, { workersCount: counts[key] || 0 });
    });

    res.json({ categories: categoriesWithCounts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Export users as CSV - accepts Authorization header or token query param
router.get('/users/export', async (req, res) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) return res.status(401).send('Unauthorized');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    } catch (e) {
      return res.status(403).send('Forbidden');
    }

    const adminUser = await User.findById(payload.userId);
    if (!adminUser || !adminUser.isAdmin) return res.status(403).send('Forbidden');

    const users = await User.find().select('-password').lean();
    const header = ['name', 'email', 'phone', 'location', 'createdAt', 'status'];
    const rows = users.map((u) => [u.name || '', u.email || '', u.phone || '', u.location || '', u.createdAt ? new Date(u.createdAt).toISOString() : '', u.status || '']);
    const csv = [header.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/categories', authAdmin, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const cat = new Category({ name, description, icon });
    await cat.save();
    res.status(201).json({ category: cat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/categories/:id', authAdmin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ category: cat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/categories/:id', authAdmin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
