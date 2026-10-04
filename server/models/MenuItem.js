const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, enum: ['Starters', 'Mains', 'Desserts', 'Drinks'] },
  price: { type: Number, required: true, min: 0, validate: {
    validator: value => Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7,
    message: 'Price must be finite with at most two decimal places',
  } },
  image: { type: String, default: '' },
  available: { type: Boolean, required: true, default: true },
  isSpecial: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('MenuItem', schema);
