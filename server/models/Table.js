const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true, min: 1, validate: Number.isInteger },
  seats: { type: Number, required: true, min: 1, validate: Number.isInteger },
  name: { type: String, default: '' },
  area: { type: String, default: '' },
  available: { type: Boolean, required: true, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Table', schema);
