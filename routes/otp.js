const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// If DB not connected, in production return 503.
// In development allow OTP endpoints to function and mark request with `req.dbConnected = false`.
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ MongoDB not connected - continuing in development mode for OTP endpoints');
      req.dbConnected = false;
      return next();
    }
    return res.status(503).json({ message: 'Database not connected. Please try again shortly.' });
  }
  req.dbConnected = true;
  next();
});
const jwt = require('jsonwebtoken');

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  if (process.env.OTP_FAKE === 'true') return '987654';
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Clean phone number (remove spaces, dashes, parentheses, but keep +)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    console.log('📱 Sending OTP - Original phone:', phone);
    console.log('📱 Sending OTP - Cleaned phone:', cleanPhone);
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // Send SMS via Twilio (if configured), otherwise try Fast2SMS, otherwise log
    try {
      const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
      console.log('🔧 Twilio configured?', hasTwilio ? 'yes' : 'no');
      if (hasTwilio) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);

        const resp = await client.messages.create({
          body: `Your HelpMeeOut verification code is: ${otp}. Valid for 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: cleanPhone
        });

        console.log('✅ SMS sent successfully to', cleanPhone, 'SID:', resp.sid);
      } else if (process.env.FAST2SMS_API_KEY) {
        // try Fast2SMS as fallback
        console.log('🔁 Twilio not configured — trying Fast2SMS');
        try {
          const https = require('https');
          const payload = JSON.stringify({
            sender_id: 'FSTSMS',
            message: `Your HelpMeeOut verification code is: ${otp}. Valid for 5 minutes.`,
            language: 'english',
            route: 'v3',
            numbers: cleanPhone.replace(/^\+/, '')
          });

          const options = {
            hostname: 'www.fast2sms.com',
            port: 443,
            path: '/dev/bulkV2',
            method: 'POST',
            headers: {
              'authorization': process.env.FAST2SMS_API_KEY,
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          };

          await new Promise((resolve, reject) => {
            const reqFast = https.request(options, (resp) => {
              let data = '';
              resp.on('data', (chunk) => data += chunk);
              resp.on('end', () => {
                console.log('Fast2SMS response:', data);
                resolve();
              });
            });
            reqFast.on('error', (e) => reject(e));
            reqFast.write(payload);
            reqFast.end();
          });

          console.log('✅ SMS (Fast2SMS) sent to', cleanPhone);
        } catch (f2Err) {
          console.error('Fast2SMS failed:', f2Err && f2Err.message ? f2Err.message : f2Err);
          console.log('📱 OTP for', cleanPhone, ':', otp, '(logged as fallback)');
        }
      } else {
        // Development / no SMS provider - log OTP
        console.log('📱 OTP for', cleanPhone, ':', otp);
        console.log('💡 To enable SMS, set TWILIO_* or FAST2SMS_API_KEY in .env');
      }
    } catch (smsError) {
      console.error('⚠️ SMS sending failed:', smsError && smsError.message ? smsError.message : smsError);
      console.log('📱 OTP for', cleanPhone, ':', otp, '(fallback to console)');
    }
    
    console.log('📱 OTP stored for', cleanPhone);
    console.log('📱 Current OTP store keys:', Array.from(otpStore.keys()));

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // For development, include OTP in response (remove in production)
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    console.log('🔍 Verifying OTP - Original phone:', phone);
    console.log('🔍 Verifying OTP - Cleaned phone:', cleanPhone);
    console.log('🔍 Verifying OTP - OTP code:', otp);
    console.log('🔍 Current OTP store keys:', Array.from(otpStore.keys()));
    
    const storedData = otpStore.get(cleanPhone);

    if (!storedData) {
      console.log('❌ OTP not found for phone:', cleanPhone);
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new OTP.' });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check attempts (max 5 attempts)
    if (storedData.attempts >= 5) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({ 
        message: 'Invalid OTP. Please try again.',
        attemptsLeft: 5 - storedData.attempts
      });
    }

    // OTP verified successfully - remove from store
    otpStore.delete(cleanPhone);

    // Check if user exists with this phone number
    let user;
    let isNewUser = false;
    const isWorker = req.body.isWorker || false;

    if (req.dbConnected) {
      user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        // Create new user with phone number
        isNewUser = true;
        user = new User({
          name: 'User',
          email: `${cleanPhone}@helpmeeout.com`,
          password: Math.random().toString(36).slice(-8), // Random password
          phone: cleanPhone,
          role: isWorker ? 'provider' : 'customer' // Set role based on login type
        });
        await user.save();
      }
    } else {
      // Development fallback when DB is not available: create an in-memory user object
      isNewUser = true;
      user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Dev User',
        email: `${cleanPhone}@dev.local`,
        phone: cleanPhone,
        role: isWorker ? 'provider' : 'customer'
      };
      console.warn('⚠️ Using in-memory user fallback for', cleanPhone);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      isNewUser
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
});

// Resend OTP
router.post('/resend', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    console.log('📱 Resending OTP - Original phone:', phone);
    console.log('📱 Resending OTP - Cleaned phone:', cleanPhone);
    
    // Generate new OTP
    const otp = generateOTP();
    
    // Store new OTP
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // Send SMS via Twilio (if configured), Fast2SMS (if configured), or log for development
    try {
      const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
      console.log('🔧 Twilio configured?', hasTwilio ? 'yes' : 'no');
      if (hasTwilio) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);

        await client.messages.create({
          body: `Your HelpMeeOut verification code is: ${otp}. Valid for 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: cleanPhone
        });

        console.log('✅ SMS resent successfully to', cleanPhone);
      } else if (process.env.FAST2SMS_API_KEY) {
        console.log('🔁 Twilio not configured — trying Fast2SMS for resend');
        try {
          const https = require('https');
          const payload = JSON.stringify({
            sender_id: 'FSTSMS',
            message: `Your HelpMeeOut verification code is: ${otp}. Valid for 5 minutes.`,
            language: 'english',
            route: 'v3',
            numbers: cleanPhone.replace(/^\+/, '')
          });

          const options = {
            hostname: 'www.fast2sms.com',
            port: 443,
            path: '/dev/bulkV2',
            method: 'POST',
            headers: {
              'authorization': process.env.FAST2SMS_API_KEY,
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          };

          await new Promise((resolve, reject) => {
            const reqFast = https.request(options, (resp) => {
              let data = '';
              resp.on('data', (chunk) => data += chunk);
              resp.on('end', () => {
                console.log('Fast2SMS resend response:', data);
                resolve();
              });
            });
            reqFast.on('error', (e) => reject(e));
            reqFast.write(payload);
            reqFast.end();
          });

          console.log('✅ SMS (Fast2SMS) resent to', cleanPhone);
        } catch (f2Err) {
          console.error('Fast2SMS resend failed:', f2Err && f2Err.message ? f2Err.message : f2Err);
          console.log('📱 Resent OTP for', cleanPhone, ':', otp, '(logged as fallback)');
        }
      } else {
        console.log('📱 Resent OTP for', cleanPhone, ':', otp);
        console.log('💡 To enable SMS, configure TWILIO_* or FAST2SMS_API_KEY in .env');
      }
    } catch (smsError) {
      console.error('⚠️ SMS sending failed:', smsError && smsError.message ? smsError.message : smsError);
      console.log('📱 Resent OTP for', cleanPhone, ':', otp, '(fallback to console)');
    }
    
    console.log('📱 Resent OTP stored for', cleanPhone);
    console.log('📱 Current OTP store keys:', Array.from(otpStore.keys()));

    res.json({
      success: true,
      message: 'OTP resent successfully',
      // For development only
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
});

module.exports = router;

