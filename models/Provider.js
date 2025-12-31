const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    phone: { type: String, required: true },
    serviceCategory: { type: String, required: true },
    experience: { type: Number, default: 0 },
    skills: { type: String },
    status: {
      type: String,
      enum: ["active", "busy", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);
// Provider model deprecated — re-export ServiceProvider to maintain compatibility.
// Keep this file as a thin alias so older imports continue to work.
module.exports = require('./ServiceProvider');
