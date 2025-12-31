const express = require('express');
const User = require('../models/User');
const Provider = require('../models/ServiceProvider');
const Category = require('../models/Category');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  const users = await User.countDocuments({ isAdmin: false });
  const workers = await Provider.countDocuments();
  const categories = await Category.countDocuments();
  const locations = await User.distinct("location");

  const activeWorkers = await Provider.countDocuments({ status: "active" });
  const busyWorkers = await Provider.countDocuments({ status: "busy" });

  const categoryStats = await Provider.aggregate([
    { $group: { _id: "$serviceCategory", count: { $sum: 1 } } }
  ]);

  res.json({
    users,
    workers,
    categories,
    locations: locations.length,
    activeWorkers,
    busyWorkers,
    categoryStats: categoryStats.map(c => ({
      name: c._id,
      count: c.count
    }))
  });
});

module.exports = router;
