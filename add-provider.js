
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpmeout';

async function addProvider() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Create or find user
    let user = await User.findOne({ email: 'provider@example.com' });
    
    if (!user) {
      user = new User({
        name: 'Provider Name',
        email: 'provider@example.com',
        password: 'password123',
        phone: '+1-555-9999',
        address: '123 Provider St, City, State',
        role: 'provider'
      });
      await user.save();
      console.log('✅ Created user:', user.email);
    } else {
      console.log('✅ Found existing user:', user.email);
    }

    // Check if provider already exists
    const existingProvider = await ServiceProvider.findOne({ userId: user._id });
    if (existingProvider) {
      console.log('⚠️  Provider already exists for this user');
      process.exit(0);
    }

    // Step 2: Create service provider
    const provider = new ServiceProvider({
      userId: user._id,
      businessName: 'My Plumbing Service',
      serviceCategory: 'plumbing', // Options: plumbing, construction, driving, electrical, cleaning, painting, carpentry, other
      description: 'Professional plumbing services for all your needs. 10+ years of experience in fixing leaks, installations, and repairs.',
      experience: 10,
      hourlyRate: 50,
      phone: '+91 7032042792',
      email: 'provider@example.com',
      address: {
        street: '123 Provider Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        fullAddress: '123 Provider Street, New York, NY 10001'
      },
      availability: 'available', // Options: available, busy, unavailable
      rating: 4.5,
      totalReviews: 25,
      verified: true
    });

    await provider.save();
    console.log('✅ Service provider created:', provider.businessName);
    console.log('📍 Provider ID:', provider._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addProvider();

