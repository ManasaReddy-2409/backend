const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  serviceCategory: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String
  },
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  hourlyRate: {
    type: Number,
    min: 0,
    default: 0
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    fullAddress: { type: String }
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  teamMembers: [
    {
      name: { type: String },
      phone: { type: String },
      role: { type: String }
    }
  ],
  images: [{
    type: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);

