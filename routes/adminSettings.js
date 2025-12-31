const express = require('express');
const Settings = require('../models/Settings');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', adminAuth, async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      otpEnabled: true,
      minRadius: 5,
      maxRadius: 50
    });
  }
  res.json(settings);
});

router.put('/', adminAuth, async (req, res) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
  res.json(settings);
});

module.exports = router;
