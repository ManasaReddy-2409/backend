/**
 * ensure-providers.js
 * Create demo ServiceProvider entries so each category has at least the desired count.
 * Usage: node ensure-providers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const ServiceProvider = require('./models/ServiceProvider');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/helpmeout';

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  // Desired minimum counts (can be adjusted)
  const desired = {
    electrician: 3,
    plumbing: 4,
    carpenter: 5,
    cleaner: 6,
    painter: 7,
    construction: 8
  };

  // Fetch categories from DB
  const categories = await Category.find({}).lean();
  for (const cat of categories) {
    const key = (cat.name || '').toString().toLowerCase();
    const want = desired[key] || 0;
    if (!want) continue;

    const have = await ServiceProvider.countDocuments({ serviceCategory: key });
    if (have >= want) {
      console.log(`Category ${cat.name} already has ${have}/${want}`);
      continue;
    }

    const toCreate = want - have;
    console.log(`Creating ${toCreate} providers for category ${cat.name}`);
    const docs = [];
    for (let i = 0; i < toCreate; i++) {
      const idx = have + i + 1;
      docs.push({
        businessName: `${cat.name} Demo ${idx}`,
        phone: `+919000000${String(Math.floor(100 + Math.random() * 899)).padStart(3,'0')}`,
        serviceCategory: key,
        description: `Demo provider for ${cat.name}`,
        experience: Math.floor(Math.random() * 10) + 1,
        availability: 'available',
        verified: true
      });
    }

    await ServiceProvider.insertMany(docs);
    console.log(`Inserted ${docs.length} providers for ${cat.name}`);
  }

  console.log('Done');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
