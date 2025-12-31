const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  console.log('Atlas setup helper — will create backend/.env and optionally test connection');

  const mode = (await ask('Choose (1) Atlas or (2) Local MongoDB [1/2]: ')) || '1';

  let env = {};
  env.PORT = await ask('PORT (default 6000): ') || '6000';

  if (mode === '2') {
    env.MONGODB_URI = await ask('Local URI (default mongodb://localhost:27017/helpmeout): ') || 'mongodb://localhost:27017/helpmeout';
  } else {
    const user = await ask('Atlas username: ');
    const pass = await ask('Atlas password (will be placed in URI): ');
    const cluster = await ask('Cluster host (example: cluster0.xxxxx.mongodb.net): ');
    const db = await ask('Database name (default helpmeout): ') || 'helpmeout';
    // Build mongodb+srv URI
    env.MONGODB_URI = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${cluster}/${db}?retryWrites=true&w=majority`;
  }

  env.JWT_SECRET = await ask('JWT_SECRET (choose a strong secret): ') || 'change_this_jwt_secret';
  env.ADMIN_EMAIL = await ask('Initial admin email (default admin@helpmeout.local): ') || 'admin@helpmeout.local';
  env.ADMIN_PASSWORD = await ask('Initial admin password (will be used if no admin exists): ') || 'admin123';
  env.NODE_ENV = await ask('NODE_ENV (development/production) [development]: ') || 'development';

  const out = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  const dest = path.resolve(__dirname, '.env');
  fs.writeFileSync(dest, out, { encoding: 'utf8', flag: 'w' });
  console.log('Wrote', dest);

  const testNow = (await ask('Test DB connection now? [y/N]: ')).toLowerCase();
  if (testNow === 'y') {
    console.log('Testing connection to:', env.MONGODB_URI.replace(/:[^@]+@/, ':*****@'));
    try {
      await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('✅ Connected to MongoDB successfully');
      await mongoose.disconnect();
    } catch (err) {
      console.error('❌ Connection failed:', err.message || err);
      console.error('Check atlas network access, credentials, and that the URI is correct.');
    }
  }

  console.log('Setup complete. Restart your backend (npm start) to use the new .env');
}

main().catch(err => { console.error(err); process.exit(1); });
