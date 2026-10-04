const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['customer', 'manager'], default: 'customer' },
}, { timestamps: true });
module.exports = mongoose.model('User', schema);
