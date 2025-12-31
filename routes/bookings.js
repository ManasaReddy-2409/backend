const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create booking
router.post('/', async (req, res) => {
  try {
    const {
      serviceType,
      description,
      address,
      scheduledDate,
      contactPhone,
      contactEmail,
      customerId,
      providerId
    } = req.body;

    // Validate required fields
    if (!serviceType || !description || !address || !scheduledDate || !contactPhone || !contactEmail) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['serviceType', 'description', 'address', 'scheduledDate', 'contactPhone', 'contactEmail']
      });
    }

    if (!customerId || !providerId) {
      return res.status(400).json({ 
        message: 'Customer ID and Provider ID are required' 
      });
    }

    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ 
        message: 'Invalid Customer ID format. Please login again.' 
      });
    }
    
    // For providerId, check if it's a valid ObjectId or if it's from local data
    // If not valid ObjectId, try to find provider by other means (for demo/testing)
    let validProviderId = providerId;
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      // If providerId is not a valid ObjectId, it might be from local data
      // Map local provider IDs to database providers by service category
      const ServiceProvider = require('../models/ServiceProvider');
      
      // Extract service category from local provider ID (e.g., "ind-plumb-1" -> "plumbing")
      let serviceCategory = 'plumbing'; // default
      if (providerId.includes('plumb')) serviceCategory = 'plumbing';
      else if (providerId.includes('construct')) serviceCategory = 'construction';
      else if (providerId.includes('driv')) serviceCategory = 'driving';
      else if (providerId.includes('electr')) serviceCategory = 'electrical';
      else if (providerId.includes('clean')) serviceCategory = 'cleaning';
      else if (providerId.includes('paint')) serviceCategory = 'painting';
      else if (providerId.includes('carp')) serviceCategory = 'carpentry';
      
      // Find a provider with matching service category
      const matchingProvider = await ServiceProvider.findOne({ 
        serviceCategory: serviceCategory 
      });
      
      if (matchingProvider) {
        validProviderId = matchingProvider._id;
        console.log(`✅ Mapped local provider "${providerId}" to database provider: ${matchingProvider.businessName}`);
      } else {
        // Fallback to first available provider
        const firstProvider = await ServiceProvider.findOne();
        if (firstProvider) {
          validProviderId = firstProvider._id;
          console.log(`⚠️  Using first available provider for booking: ${firstProvider.businessName}`);
        } else {
          return res.status(400).json({ 
            message: 'No providers found in database. Please run: npm run seed-indian to add providers.' 
          });
        }
      }
    }

    // Check if customer exists
    const User = require('../models/User');
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ 
        message: 'Customer not found' 
      });
    }

    // Check if provider exists
    const ServiceProvider = require('../models/ServiceProvider');
    const provider = await ServiceProvider.findById(validProviderId);
    if (!provider) {
      return res.status(404).json({ 
        message: 'Service provider not found' 
      });
    }

    // Create booking
    const booking = new Booking({
      customerId,
      providerId: validProviderId,
      serviceType,
      description,
      address,
      scheduledDate: new Date(scheduledDate),
      contactPhone,
      contactEmail,
      status: 'pending'
    });

    await booking.save();
    
    // Populate provider details for response (with error handling)
    try {
      await booking.populate('providerId', 'businessName phone email address');
    } catch (populateError) {
      console.warn('Could not populate provider:', populateError.message);
    }
    
    try {
      await booking.populate('customerId', 'name email phone');
    } catch (populateError) {
      console.warn('Could not populate customer:', populateError.message);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get bookings for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.customerId })
      .populate('providerId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookings for a provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.params.providerId })
      .populate('customerId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

