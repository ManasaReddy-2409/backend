require('dotenv').config();
const mongoose = require('mongoose');
const ServiceProvider = require('./models/ServiceProvider');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/helpmeout';

const DEFAULT_PROVIDERS = [
  // Electrician (3)
  { businessName: 'Ramesh Electrical Works', phone: '+919876543219', serviceCategory: 'electrical', description: 'Licensed electrician', experience: 14, availability: 'available', verified: true },
  { businessName: 'Srinivas Power Solutions', phone: '+919876543220', serviceCategory: 'electrical', description: 'Residential & commercial electrical services', experience: 11, availability: 'available', verified: true },
  { businessName: 'Kavitha Electrical Services', phone: '+919876543221', serviceCategory: 'electrical', description: 'Expert wiring & repairs', experience: 7, availability: 'available', verified: true },

  // Plumbing (4)
  { businessName: 'Ramu Plumbing Services', phone: '+919876543210', serviceCategory: 'plumbing', description: 'Expert plumber', experience: 12, availability: 'available', verified: true },
  { businessName: 'Priya Water Solutions', phone: '+919876543211', serviceCategory: 'plumbing', description: 'Quick plumbing repairs', experience: 8, availability: 'available', verified: true },
  { businessName: 'Mohan Pipe Works', phone: '+919876543212', serviceCategory: 'plumbing', description: 'Pipe installation & repair', experience: 15, availability: 'available', verified: true },
  { businessName: 'AquaFix Services', phone: '+919876543213', serviceCategory: 'plumbing', description: 'Emergency plumbing', experience: 6, availability: 'available', verified: true },

  // Carpenter (5)
  { businessName: 'Murthy Carpenter', phone: '+919876543214', serviceCategory: 'carpentry', description: 'Custom furniture & repairs', experience: 16, availability: 'available', verified: true },
  { businessName: 'Lakshmi Wood Works', phone: '+919876543215', serviceCategory: 'carpentry', description: 'Professional carpentry', experience: 10, availability: 'available', verified: true },
  { businessName: 'Prasad Furniture Works', phone: '+919876543216', serviceCategory: 'carpentry', description: 'Expert woodwork', experience: 13, availability: 'available', verified: true },
  { businessName: 'WoodCraft Studio', phone: '+919876543217', serviceCategory: 'carpentry', description: 'Custom joinery', experience: 9, availability: 'available', verified: true },
  { businessName: 'Raju Timber Works', phone: '+919876543218', serviceCategory: 'carpentry', description: 'Repair & installation', experience: 7, availability: 'available', verified: true },

  // Cleaner (6)
  { businessName: 'Geetha Cleaning Services', phone: '+9198765432199', serviceCategory: 'cleaning', description: 'Home & office cleaning', experience: 5, availability: 'available', verified: true },
  { businessName: 'Rajesh Deep Clean', phone: '+9198765432200', serviceCategory: 'cleaning', description: 'Deep cleaning specialists', experience: 8, availability: 'available', verified: true },
  { businessName: 'Meera Home Cleaners', phone: '+9198765432201', serviceCategory: 'cleaning', description: 'Regular & one-time cleaning', experience: 6, availability: 'available', verified: true },
  { businessName: 'Sparkle Clean Co', phone: '+9198765432202', serviceCategory: 'cleaning', description: 'Professional cleaning crew', experience: 4, availability: 'available', verified: true },
  { businessName: 'Fresh Home Services', phone: '+9198765432203', serviceCategory: 'cleaning', description: 'Domestic cleaning', experience: 3, availability: 'available', verified: true },
  { businessName: 'CityClean Solutions', phone: '+9198765432204', serviceCategory: 'cleaning', description: 'Commercial cleaning', experience: 9, availability: 'available', verified: true },

  // Painting (7)
  { businessName: 'Nagesh Paint Works', phone: '+9198765432205', serviceCategory: 'painting', description: 'Interior & exterior painting', experience: 12, availability: 'available', verified: true },
  { businessName: 'Padma Painting Services', phone: '+9198765432206', serviceCategory: 'painting', description: 'Professional painting', experience: 9, availability: 'available', verified: true },
  { businessName: 'Chandu Color Works', phone: '+9198765432207', serviceCategory: 'painting', description: 'Decorative painting', experience: 15, availability: 'available', verified: true },
  { businessName: 'Vijay Color Masters', phone: '+9198765432208', serviceCategory: 'painting', description: 'Durable finishes', experience: 9, availability: 'available', verified: true },
  { businessName: 'Asha Wall Designers', phone: '+9198765432209', serviceCategory: 'painting', description: 'Murals & textured finishes', experience: 11, availability: 'available', verified: true },
  { businessName: 'ColorTech Painters', phone: '+9198765432210', serviceCategory: 'painting', description: 'Commercial painting', experience: 14, availability: 'available', verified: true },
  { businessName: 'Shiva Paint & Co', phone: '+9198765432211', serviceCategory: 'painting', description: 'Color consultation & premium paints', experience: 7, availability: 'available', verified: true }
];

async function main(){
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  for(const p of DEFAULT_PROVIDERS){
    const exists = await ServiceProvider.findOne({ businessName: p.businessName });
    if (exists) {
      console.log('Exists:', p.businessName);
      continue;
    }
    const doc = new ServiceProvider(p);
    await doc.save();
    console.log('Inserted:', p.businessName);
  }

  console.log('Seeding complete');
  process.exit(0);
}

main().catch(err=>{ console.error(err); process.exit(1); });
