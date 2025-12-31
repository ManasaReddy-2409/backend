const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpmeout';

const sampleProviders = [
  {
    userId: null, // Will be set after creating user
    businessName: 'Expert Plumbing Services',
    serviceCategory: 'plumbing',
    description: 'Professional plumbing services for residential and commercial properties. 15+ years of experience in fixing leaks, installations, and repairs.',
    experience: 15,
    hourlyRate: 45,
    phone: '+1-555-0101',
    email: 'expert.plumbing@example.com',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      fullAddress: '123 Main Street, New York, NY 10001'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 127,
    verified: true
  },
  {
    userId: null,
    businessName: 'City Construction Co.',
    serviceCategory: 'construction',
    description: 'Full-service construction company specializing in home renovations, additions, and commercial projects. Licensed and insured.',
    experience: 20,
    hourlyRate: 65,
    phone: '+1-555-0102',
    email: 'city.construction@example.com',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      fullAddress: '456 Oak Avenue, Los Angeles, CA 90001'
    },
    availability: 'available',
    rating: 4.9,
    totalReviews: 89,
    verified: true
  },
  {
    userId: null,
    businessName: 'Reliable Driving Services',
    serviceCategory: 'driving',
    description: 'Professional driving services including personal driver, delivery, and transportation. Safe and punctual service.',
    experience: 8,
    hourlyRate: 35,
    phone: '+1-555-0103',
    email: 'reliable.driving@example.com',
    address: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      fullAddress: '789 Pine Road, Chicago, IL 60601'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 203,
    verified: true
  },
  {
    userId: null,
    businessName: 'Spark Electrical Solutions',
    serviceCategory: 'electrical',
    description: 'Licensed electrician providing wiring, repairs, installations, and electrical system maintenance. Available 24/7 for emergencies.',
    experience: 12,
    hourlyRate: 55,
    phone: '+1-555-0104',
    email: 'spark.electrical@example.com',
    address: {
      street: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      fullAddress: '321 Elm Street, Houston, TX 77001'
    },
    availability: 'available',
    rating: 4.9,
    totalReviews: 156,
    verified: true
  },
  {
    userId: null,
    businessName: 'Clean Pro Services',
    serviceCategory: 'cleaning',
    description: 'Professional cleaning services for homes and offices. Deep cleaning, regular maintenance, and move-in/out cleaning available.',
    experience: 6,
    hourlyRate: 30,
    phone: '+1-555-0105',
    email: 'clean.pro@example.com',
    address: {
      street: '654 Maple Drive',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      fullAddress: '654 Maple Drive, Phoenix, AZ 85001'
    },
    availability: 'available',
    rating: 4.6,
    totalReviews: 94,
    verified: true
  },
  {
    userId: null,
    businessName: 'Color Masters Painting',
    serviceCategory: 'painting',
    description: 'Expert painters specializing in interior and exterior painting. Quality workmanship with attention to detail.',
    experience: 10,
    hourlyRate: 40,
    phone: '+1-555-0106',
    email: 'color.masters@example.com',
    address: {
      street: '987 Cedar Lane',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19101',
      fullAddress: '987 Cedar Lane, Philadelphia, PA 19101'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 112,
    verified: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await ServiceProvider.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users and providers
    for (const providerData of sampleProviders) {
      // Create user for provider
      const user = new User({
        name: providerData.businessName.split(' ')[0] + ' Owner',
        email: providerData.email,
        password: 'password123', // Default password for demo
        phone: providerData.phone,
        address: providerData.address.fullAddress,
        role: 'provider'
      });
      
      await user.save();
      console.log(`✅ Created user: ${user.email}`);

      // Create provider
      const provider = new ServiceProvider({
        ...providerData,
        userId: user._id
      });
      
      await provider.save();
      console.log(`✅ Created provider: ${provider.businessName}`);
    }

    // Create a sample customer
    const customer = new User({
      name: 'John Doe',
      email: 'customer@example.com',
      password: 'password123',
      phone: '+1-555-9999',
      address: '100 Customer Street, Any City, ST 12345',
      role: 'customer'
    });
    await customer.save();
    console.log(`✅ Created customer: ${customer.email}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('   Provider: expert.plumbing@example.com / password123');
    console.log('   Customer: customer@example.com / password123');
    console.log('\n💡 You can now start the application and login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

