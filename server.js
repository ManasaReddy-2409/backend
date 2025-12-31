const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const adminVerificationRoutes = require('./routes/adminVerification');
const adminAnalyticsRoutes = require('./routes/adminAnalytics');
const adminSettingsRoutes = require('./routes/adminSettings');

const app = express();

/* =========================
   Middleware
========================= */
app.set('trust proxy', true);

// CORS configuration
const CLIENT_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  process.env.ALLOWED_ORIGIN ||
  '*';

app.use(
  cors({
    origin: CLIENT_URL === '*' ? '*' : CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: CLIENT_URL !== '*',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Database Connection
========================= */
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://localhost:27017/helpmeout';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');

    // ✅ Create default admin ONLY in development
    if (process.env.NODE_ENV !== 'production') {
      const User = require('./models/User');
      const adminExists = await User.findOne({ isAdmin: true });

      if (!adminExists) {
        const admin = new User({
          name: 'Admin User',
          email: 'admin@local.dev',
          password: 'admin123',
          phone: '0000000000',
          role: 'customer',
          isAdmin: true,
        });
        await admin.save();
        console.log('🔐 Default admin created (DEV ONLY)');
      }
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

/* =========================
   Routes
========================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/services', require('./routes/services'));

app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/adminProviders'));
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/verification', adminVerificationRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

/* =========================
   Health Check
========================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/* =========================
   Optional Frontend Serving
========================= */
if (
  process.env.SERVE_FRONTEND === 'true' ||
  process.env.NODE_ENV === 'production'
) {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');

  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
    console.log('📦 Serving frontend from', buildPath);
  } else {
    console.log(
      '⚠️ Frontend build not found – skipping static serve'
    );
  }
}

/* =========================
   Server Start
========================= */
const PORT = process.env.PORT || 6000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* =========================
   Graceful Shutdown
========================= */
const gracefulShutdown = () => {
  console.log('⚠️ Graceful shutdown initiated');
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
