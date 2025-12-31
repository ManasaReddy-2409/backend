const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  otpEnabled: Boolean,
  minRadius: Number,
  maxRadius: Number
});
module.exports = mongoose.model('Settings', SettingsSchema);
