const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');

// Get all providers
router.get('/', async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let query = {};

    if (category) {
      query.serviceCategory = category;
    }
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }
    if (search) {
      query.$or = [
        { businessName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const providers = await ServiceProvider.find(query)
      .populate('userId', 'name email phone')
      .sort({ rating: -1, createdAt: -1 });

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single provider
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create provider (for providers to register their service)
router.post('/', async (req, res) => {
  try {
    const providerData = req.body;
    const provider = new ServiceProvider(providerData);
    await provider.save();
    res.status(201).json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update provider
router.put('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
