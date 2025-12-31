const express = require('express');
const User = require('../models/User');
const { verifyAdmin } = require('../middleware/verifyAdmin');
const { Parser } = require('json2csv');

const router = express.Router();

router.get('/', verifyAdmin, async (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 6);
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    users,
    total,
    pages: Math.ceil(total / limit),
  });
});

router.get('/export', verifyAdmin, async (req, res) => {
  const users = await User.find();

  const parser = new Parser({
    fields: [
      { label: 'Name', value: 'name' },
      { label: 'Phone', value: 'phone' },
      { label: 'Location', value: 'location' },
      { label: 'Status', value: 'status' },
      { label: 'Registered', value: 'createdAt' },
    ],
  });

  const csv = parser.parse(users);

  res.header('Content-Type', 'text/csv');
  res.attachment('users.csv');
  res.send(csv);
});

module.exports = router;
