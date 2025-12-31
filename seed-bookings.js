const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('./models/Booking');
const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpmeout';

const sampleBookings = [
  {
    serviceType: 'plumbing',
    description: 'Need plumbing repair for leaking pipe in kitchen. Water is leaking from under the sink.',
    address: '123 MG Road, Near Bus Stand, Vijayawada, Andhra Pradesh 520001',
    scheduledDate: new Date('2024-12-25T10:00:00Z'),
    contactPhone: '+91-9876543210',
    contactEmail: 'customer@example.com',
    status: 'pending'
  },
  {
    serviceType: 'construction',
    description: 'Need construction work for home renovation. Building a new room extension.',
    address: '456 Benz Circle, Eluru Road, Vijayawada, Andhra Pradesh 520002',
    scheduledDate: new Date('2024-12-26T14:00:00Z'),
    contactPhone: '+91-9876543211',
    contactEmail: 'customer2@example.com',
    status: 'accepted'
  },
  {
    serviceType: 'electrical',
    description: 'Need electrical wiring for new room. Installing lights and switches.',
    address: '789 Patamata, Main Road, Vijayawada, Andhra Pradesh 520008',
    scheduledDate: new Date('2024-12-27T09:00:00Z'),
    contactPhone: '+91-9876543212',
    contactEmail: 'customer3@example.com',
    status: 'pending'
  },
  {
    serviceType: 'cleaning',
    description: 'Need deep cleaning service for entire house before moving in.',
    address: '321 Siddhartha Nagar, Ring Road, Vijayawada, Andhra Pradesh 520003',
    scheduledDate: new Date('2024-12-28T11:00:00Z'),
    contactPhone: '+91-9876543213',
    contactEmail: 'customer4@example.com',
    status: 'pending'
  },
  {
    serviceType: 'painting',
    description: 'Need interior painting for 3 bedrooms and living room.',
    address: '654 Auto Nagar, Industrial Area, Vijayawada, Andhra Pradesh 520007',
    scheduledDate: new Date('2024-12-29T08:00:00Z'),
    contactPhone: '+91-9876543214',
    contactEmail: 'customer5@example.com',
    status: 'in-progress'
  },
  {
    serviceType: 'driving',
    description: 'Need driver service for outstation trip to Hyderabad.',
    address: '987 Labbipet, Near Clock Tower, Vijayawada, Andhra Pradesh 520010',
    scheduledDate: new Date('2024-12-30T06:00:00Z'),
    contactPhone: '+91-9876543215',
    contactEmail: 'customer6@example.com',
    status: 'pending'
  }
];

async function seedBookings() {
  try {
    console.log('🌱 Starting booking seeding...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get first customer (or create one if doesn't exist)
    let customer = await User.findOne({ role: 'customer' });
    if (!customer) {
      console.log('⚠️  No customer found. Creating sample customer...');
      customer = new User({
        name: 'Sample Customer',
        email: 'customer@example.com',
        password: 'password123',
        phone: '+91-9876543210',
        address: '123 MG Road, Vijayawada, AP 520001',
        role: 'customer'
      });
      await customer.save();
      console.log('✅ Created customer:', customer.email);
    } else {
      console.log(`✅ Found customer: ${customer.email}`);
    }

    // Get providers (need at least 6)
    const providers = await ServiceProvider.find().limit(6);
    if (providers.length === 0) {
      console.error('❌ No providers found. Please run: npm run seed-indian');
      console.error('   This will create providers in the database.');
      process.exit(1);
    }
    console.log(`✅ Found ${providers.length} providers`);

    // Clear existing bookings (optional - comment out if you want to keep existing)
    // await Booking.deleteMany({});
    // console.log('🗑️  Cleared existing bookings');

    let createdCount = 0;
    let skippedCount = 0;

    // Create bookings
    for (let i = 0; i < sampleBookings.length; i++) {
      const bookingData = sampleBookings[i];
      const provider = providers[i % providers.length]; // Cycle through providers

      // Check if booking already exists
      const existingBooking = await Booking.findOne({
        customerId: customer._id,
        providerId: provider._id,
        scheduledDate: bookingData.scheduledDate
      });

      if (existingBooking) {
        console.log(`⏭️  Skipped (already exists): ${bookingData.serviceType} for ${provider.businessName}`);
        skippedCount++;
        continue;
      }

      const booking = new Booking({
        customerId: customer._id,
        providerId: provider._id,
        ...bookingData
      });

      await booking.save();
      console.log(`✅ Created booking: ${bookingData.serviceType} for ${provider.businessName}`);
      createdCount++;
    }

    console.log('\n🎉 Booking seeding completed!');
    console.log(`✅ Created: ${createdCount} bookings`);
    console.log(`⏭️  Skipped: ${skippedCount} bookings (already exist)`);
    console.log('\n💡 You can now view these bookings in MongoDB Compass or through the API.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
    process.exit(1);
  }
}

seedBookings();









