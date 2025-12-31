const mongoose = require('mongoose');

async function test(uri) {
  if (!uri) {
    console.error('Usage: node test_connection.js <mongo-uri>');
    process.exit(1);
  }
  try {
    console.log('Connecting to', uri.replace(/:[^@]+@/, ':*****@'));
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connection successful');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message || err);
    process.exit(2);
  }
}

test(process.argv[2]);
