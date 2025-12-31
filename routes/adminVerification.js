const express = require('express');
const Worker = require('../models/Worker');
const { verifyAdmin } = require('../middleware/verifyAdmin');

const router = express.Router();

router.get('/', verifyAdmin, async (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = 6;
  const skip = (page - 1) * limit;

  const status = req.query.status;
  const filter = status ? { status } : {};

  const total = await Worker.countDocuments(filter);
  const workers = await Worker.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const stats = {
    pending: await Worker.countDocuments({ status: 'pending' }),
    approved: await Worker.countDocuments({ status: 'approved' }),
    rejected: await Worker.countDocuments({ status: 'rejected' }),
  };

  res.json({
    workers,
    stats,
    total,
    pages: Math.ceil(total / limit),
  });
});

router.post('/:id/action', verifyAdmin, async (req, res) => {
  const { action } = req.body;

  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  await Worker.findByIdAndUpdate(req.params.id, { status: action });
  res.json({ message: 'Updated' });
});

module.exports = router;
