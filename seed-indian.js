const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpmeout';

const indianProviders = [
  {
    businessName: 'Ramu Plumbing Services',
    serviceCategory: 'plumbing',
    description: 'Expert plumber with 12 years of experience. Specialized in pipe repairs, installations, and bathroom fittings. Available 24/7 for emergency services.',
    experience: 12,
    hourlyRate: 500,
    phone: '+91-9876543210',
    email: 'ramu.plumbing@gmail.com',
    address: {
      street: 'MG Road, Near Bus Stand',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520001',
      fullAddress: 'MG Road, Near Bus Stand, Vijayawada, Andhra Pradesh 520001'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 89,
    verified: true
  },
  {
    businessName: 'Priya Water Solutions',
    serviceCategory: 'plumbing',
    description: 'Professional plumbing services by experienced technician. Quick response time and quality work guaranteed.',
    experience: 8,
    hourlyRate: 450,
    phone: '+91-9876543211',
    email: 'priya.water@gmail.com',
    address: {
      street: 'Benz Circle, Eluru Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520002',
      fullAddress: 'Benz Circle, Eluru Road, Vijayawada, Andhra Pradesh 520002'
    },
    availability: 'available',
    rating: 4.6,
    totalReviews: 67,
    verified: true
  },
  {
    businessName: 'Mohan Pipe Works',
    serviceCategory: 'plumbing',
    description: 'Reliable plumbing services for residential and commercial properties. Expert in all types of pipe work.',
    experience: 15,
    hourlyRate: 550,
    phone: '+91-9876543212',
    email: 'mohan.pipe@gmail.com',
    address: {
      street: 'Gandhi Nagar, Main Street',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500001',
      fullAddress: 'Gandhi Nagar, Main Street, Hyderabad, Telangana 500001'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 124,
    verified: true
  },
  {
    businessName: 'Suresh Construction',
    serviceCategory: 'construction',
    description: 'Experienced construction contractor handling home building, renovations, and repairs. Quality work at affordable prices.',
    experience: 18,
    hourlyRate: 800,
    phone: '+91-9876543213',
    email: 'suresh.construction@gmail.com',
    address: {
      street: 'Auto Nagar, Industrial Area',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520007',
      fullAddress: 'Auto Nagar, Industrial Area, Vijayawada, Andhra Pradesh 520007'
    },
    availability: 'available',
    rating: 4.9,
    totalReviews: 156,
    verified: true
  },
  {
    businessName: 'Lakshmi Builders',
    serviceCategory: 'construction',
    description: 'Professional construction services with skilled workers. Specialized in home construction and interior work.',
    experience: 10,
    hourlyRate: 750,
    phone: '+91-9876543214',
    email: 'lakshmi.builders@gmail.com',
    address: {
      street: 'Siddhartha Nagar, Ring Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520003',
      fullAddress: 'Siddhartha Nagar, Ring Road, Vijayawada, Andhra Pradesh 520003'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 98,
    verified: true
  },
  {
    businessName: 'Ravi Construction Works',
    serviceCategory: 'construction',
    description: 'Trusted construction contractor with years of experience. Quality materials and timely completion guaranteed.',
    experience: 20,
    hourlyRate: 850,
    phone: '+91-9876543215',
    email: 'ravi.construction@gmail.com',
    address: {
      street: 'Patamata, Main Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520008',
      fullAddress: 'Patamata, Main Road, Vijayawada, Andhra Pradesh 520008'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 145,
    verified: true
  },
  {
    businessName: 'Kumar Driver Services',
    serviceCategory: 'driving',
    description: 'Professional driver with clean record. Available for personal, business, and long-distance trips. Safe and reliable.',
    experience: 6,
    hourlyRate: 300,
    phone: '+91-9876543216',
    email: 'kumar.driver@gmail.com',
    address: {
      street: 'Labbipet, Near Clock Tower',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520010',
      fullAddress: 'Labbipet, Near Clock Tower, Vijayawada, Andhra Pradesh 520010'
    },
    availability: 'available',
    rating: 4.6,
    totalReviews: 78,
    verified: true
  },
  {
    businessName: 'Sunitha Car Services',
    serviceCategory: 'driving',
    description: 'Experienced female driver for safe and comfortable rides. Available for all types of driving needs.',
    experience: 5,
    hourlyRate: 350,
    phone: '+91-9876543217',
    email: 'sunitha.car@gmail.com',
    address: {
      street: 'One Town, Old City',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520001',
      fullAddress: 'One Town, Old City, Vijayawada, Andhra Pradesh 520001'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 92,
    verified: true
  },
  {
    businessName: 'Venkatesh Transport',
    serviceCategory: 'driving',
    description: 'Professional driver with excellent knowledge of local routes. Punctual and courteous service.',
    experience: 9,
    hourlyRate: 400,
    phone: '+91-9876543218',
    email: 'venkatesh.transport@gmail.com',
    address: {
      street: 'Gunadala, NH-16',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520004',
      fullAddress: 'Gunadala, NH-16, Vijayawada, Andhra Pradesh 520004'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 112,
    verified: true
  },
  {
    businessName: 'Ramesh Electrical Works',
    serviceCategory: 'electrical',
    description: 'Licensed electrician with 14 years experience. Expert in wiring, repairs, and installations. Available for emergencies.',
    experience: 14,
    hourlyRate: 600,
    phone: '+91-9876543219',
    email: 'ramesh.electrical@gmail.com',
    address: {
      street: 'Bhavanipuram, Main Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520012',
      fullAddress: 'Bhavanipuram, Main Road, Vijayawada, Andhra Pradesh 520012'
    },
    availability: 'available',
    rating: 4.9,
    totalReviews: 167,
    verified: true
  },
  {
    businessName: 'Kavitha Electrical Services',
    serviceCategory: 'electrical',
    description: 'Professional electrical services by experienced technician. Quality work and safety guaranteed.',
    experience: 7,
    hourlyRate: 550,
    phone: '+91-9876543220',
    email: 'kavitha.electrical@gmail.com',
    address: {
      street: 'Nunna, Krishna District',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '521212',
      fullAddress: 'Nunna, Krishna District, Vijayawada, Andhra Pradesh 521212'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 89,
    verified: true
  },
  {
    businessName: 'Srinivas Power Solutions',
    serviceCategory: 'electrical',
    description: 'Expert electrician handling all types of electrical work. Quick response and reliable service.',
    experience: 11,
    hourlyRate: 650,
    phone: '+91-9876543221',
    email: 'srinivas.power@gmail.com',
    address: {
      street: 'Kanuru, Beach Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520007',
      fullAddress: 'Kanuru, Beach Road, Vijayawada, Andhra Pradesh 520007'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 134,
    verified: true
  },
  {
    businessName: 'Geetha Cleaning Services',
    serviceCategory: 'cleaning',
    description: 'Professional cleaning services for homes and offices. Thorough cleaning with eco-friendly products.',
    experience: 5,
    hourlyRate: 250,
    phone: '+91-9876543222',
    email: 'geetha.cleaning@gmail.com',
    address: {
      street: 'Governorpet, Main Bazaar',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520002',
      fullAddress: 'Governorpet, Main Bazaar, Vijayawada, Andhra Pradesh 520002'
    },
    availability: 'available',
    rating: 4.6,
    totalReviews: 76,
    verified: true
  },
  {
    businessName: 'Rajesh Deep Clean',
    serviceCategory: 'cleaning',
    description: 'Expert cleaning services for residential and commercial spaces. Deep cleaning and regular maintenance available.',
    experience: 8,
    hourlyRate: 300,
    phone: '+91-9876543223',
    email: 'rajesh.clean@gmail.com',
    address: {
      street: 'Machavaram, Ring Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520004',
      fullAddress: 'Machavaram, Ring Road, Vijayawada, Andhra Pradesh 520004'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 98,
    verified: true
  },
  {
    businessName: 'Meera Home Cleaners',
    serviceCategory: 'cleaning',
    description: 'Reliable cleaning services with attention to detail. Available for regular and one-time cleaning.',
    experience: 6,
    hourlyRate: 280,
    phone: '+91-9876543224',
    email: 'meera.cleaners@gmail.com',
    address: {
      street: 'Vidyadharapuram, Main Street',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520013',
      fullAddress: 'Vidyadharapuram, Main Street, Vijayawada, Andhra Pradesh 520013'
    },
    availability: 'available',
    rating: 4.5,
    totalReviews: 65,
    verified: true
  },
  {
    businessName: 'Nagesh Paint Works',
    serviceCategory: 'painting',
    description: 'Expert painter specializing in interior and exterior painting. Quality finish and color consultation available.',
    experience: 12,
    hourlyRate: 400,
    phone: '+91-9876543225',
    email: 'nagesh.paint@gmail.com',
    address: {
      street: 'Poranki, NH-65',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '521137',
      fullAddress: 'Poranki, NH-65, Vijayawada, Andhra Pradesh 521137'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 123,
    verified: true
  },
  {
    businessName: 'Padma Painting Services',
    serviceCategory: 'painting',
    description: 'Professional painting services for homes and offices. Expert in all types of paint work and finishes.',
    experience: 9,
    hourlyRate: 450,
    phone: '+91-9876543226',
    email: 'padma.painting@gmail.com',
    address: {
      street: 'Kondapalli, Industrial Area',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520003',
      fullAddress: 'Kondapalli, Industrial Area, Vijayawada, Andhra Pradesh 520003'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 107,
    verified: true
  },
  {
    businessName: 'Chandu Color Works',
    serviceCategory: 'painting',
    description: 'Experienced painter with excellent craftsmanship. Specialized in decorative painting and wall designs.',
    experience: 15,
    hourlyRate: 500,
    phone: '+91-9876543227',
    email: 'chandu.color@gmail.com',
    address: {
      street: 'Ibrahimpatnam, Main Road',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '501506',
      fullAddress: 'Ibrahimpatnam, Main Road, Hyderabad, Telangana 501506'
    },
    availability: 'available',
    rating: 4.9,
    totalReviews: 156,
    verified: true
  },
  {
    businessName: 'Murthy Carpenter',
    serviceCategory: 'carpentry',
    description: 'Skilled carpenter with expertise in furniture making, repairs, and custom woodwork. Quality craftsmanship guaranteed.',
    experience: 16,
    hourlyRate: 500,
    phone: '+91-9876543228',
    email: 'murthy.carpenter@gmail.com',
    address: {
      street: 'Moghalrajapuram, Main Street',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520010',
      fullAddress: 'Moghalrajapuram, Main Street, Vijayawada, Andhra Pradesh 520010'
    },
    availability: 'available',
    rating: 4.8,
    totalReviews: 142,
    verified: true
  },
  {
    businessName: 'Lakshmi Wood Works',
    serviceCategory: 'carpentry',
    description: 'Professional carpentry services for all your woodwork needs. Custom furniture and repairs available.',
    experience: 10,
    hourlyRate: 450,
    phone: '+91-9876543229',
    email: 'lakshmi.wood@gmail.com',
    address: {
      street: 'Ayodhya Nagar, Ring Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520003',
      fullAddress: 'Ayodhya Nagar, Ring Road, Vijayawada, Andhra Pradesh 520003'
    },
    availability: 'available',
    rating: 4.7,
    totalReviews: 98,
    verified: true
  },
  {
    businessName: 'Prasad Furniture Works',
    serviceCategory: 'carpentry',
    description: 'Expert carpenter specializing in custom furniture and home carpentry. Quality materials and skilled workmanship.',
    experience: 13,
    hourlyRate: 550,
    phone: '+91-9876543230',
    email: 'prasad.furniture@gmail.com',
    address: {
      street: 'Satyanarayanapuram, Main Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zipCode: '520011',
      fullAddress: 'Satyanarayanapuram, Main Road, Vijayawada, Andhra Pradesh 520011'
    },
    availability: 'available',
    rating: 4.9,
    totalReviews: 167,
    verified: true
  }
];

async function seedIndianProviders() {
  try {
    console.log('🌱 Starting Indian providers database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing providers (optional - comment out if you want to keep existing)
    // await ServiceProvider.deleteMany({});
    // console.log('🗑️  Cleared existing providers');

    let createdCount = 0;
    let skippedCount = 0;

    // Create users and providers
    for (const providerData of indianProviders) {
      try {
        // Check if provider already exists
        const existingProvider = await ServiceProvider.findOne({ 
          email: providerData.email 
        });

        if (existingProvider) {
          console.log(`⏭️  Skipped (already exists): ${providerData.businessName}`);
          skippedCount++;
          continue;
        }

        // Create user for provider
        let user = await User.findOne({ email: providerData.email });
        
        if (!user) {
          user = new User({
            name: providerData.businessName.split(' ')[0] + ' Owner',
            email: providerData.email,
            password: 'password123', // Default password for demo
            phone: providerData.phone,
            address: providerData.address.fullAddress,
            role: 'provider'
          });
          
          await user.save();
          console.log(`✅ Created user: ${user.email}`);
        }

        // Create provider
        const provider = new ServiceProvider({
          userId: user._id,
          ...providerData
        });
        
        await provider.save();
        console.log(`✅ Created provider: ${provider.businessName}`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creating ${providerData.businessName}:`, error.message);
      }
    }

    console.log('\n🎉 Database seeding completed!');
    console.log(`✅ Created: ${createdCount} providers`);
    console.log(`⏭️  Skipped: ${skippedCount} providers (already exist)`);
    console.log('\n💡 You can now use these providers in your application.');
    console.log('📝 Default password for all provider accounts: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedIndianProviders();









