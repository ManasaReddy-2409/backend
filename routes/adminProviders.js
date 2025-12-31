const express = require('express');
const Provider = require('../models/ServiceProvider');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.post('/providers', adminAuth, async (req, res) => {
  try {
    const {
      businessName,
      phone,
      serviceCategory,
      experience,
      skills,
      status,
      teamMembers,
    } = req.body;

    if (!businessName || !phone || !serviceCategory) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const provider = await Provider.create({
      businessName,
      phone,
      serviceCategory,
      experience,
      skills,
      status: status || 'active',
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
    });

    res.status(201).json({ provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save worker' });
  }
});

router.get('/providers', adminAuth, async (req, res) => {
  const providers = await Provider.find().sort({ createdAt: -1 });
  res.json({ providers });
});

module.exports = router;
