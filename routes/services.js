const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const ServiceProvider = require('../models/ServiceProvider');

// Get service categories from DB (public)
router.get('/categories', async (req, res) => {
  try {
    // fetch active categories
    const categories = await Category.find({ active: { $ne: false } }).sort({ createdAt: -1 }).lean();

    // compute provider counts per category (case-insensitive)
    const providers = await ServiceProvider.find().select('serviceCategory').lean();
    const counts = {};
    providers.forEach((p) => {
      if (!p.serviceCategory) return;
      const key = p.serviceCategory.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });

    // map db categories into client-friendly shape
    const out = categories.map((c) => {
      const key = (c.name || '').toLowerCase();
      return {
        _id: c._id,
        id: key || String(c._id),
        name: c.name,
        description: c.description,
        icon: c.icon || undefined,
        workersCount: counts[key] || 0
      };
    });

    res.json(out);
  } catch (err) {
    console.error('Failed to load categories:', err && err.message ? err.message : err);
    // fallback to static list for safety
    const categories = [
      { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
      { id: 'construction', name: 'Construction', icon: '🏗️' },
      { id: 'driving', name: 'Driving', icon: '🚗' },
      { id: 'electrical', name: 'Electrical', icon: '⚡' },
      { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
      { id: 'painting', name: 'Painting', icon: '🎨' },
      { id: 'carpentry', name: 'Carpentry', icon: '🪚' },
      { id: 'gardening', name: 'Gardening', icon: '🌱' },
      { id: 'appliance', name: 'Appliance Repair', icon: '🔌' },
      { id: 'other', name: 'Other', icon: '🔨' }
    ];
    res.json(categories);
  }
});

module.exports = router;

