const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    category: String,
    experience: Number,
    serviceRadius: Number,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
