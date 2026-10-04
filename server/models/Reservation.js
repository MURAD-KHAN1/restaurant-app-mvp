const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^(1[2-9]|2[0-2]):00$/ },
  partySize: { type: Number, required: true, min: 1, max: 12, validate: Number.isInteger },
  phone: { type: String, required: true, match: /^03[0-9]{2}-[0-9]{7}$/ },
  status: { type: String, required: true, enum: ['Pending', 'Accepted', 'Declined', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });
module.exports = mongoose.model('Reservation', schema);
