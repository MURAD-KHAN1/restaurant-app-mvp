const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
  note: { type: String, default: '', maxlength: 500 },
  name: { type: String, required: true, trim: true },
  unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });
const money = () => ({ type: Number, required: true, min: 0 });
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: { type: [itemSchema], required: true, validate: {
    validator: items => items.length > 0, message: 'Order must contain at least one item',
  } },
  subtotal: money(), serviceCharge: money(), salesTax: money(), discount: money(), total: money(),
  promoCode: { type: String, default: '', enum: ['', 'WELCOME10', 'FEAST20'] },
  orderType: { type: String, required: true, enum: ['Dine-in', 'Takeaway'] },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null,
    required: function () { return this.orderType === 'Dine-in'; } },
  pickupTime: { type: String, default: null, enum: [null, '15 minutes', '30 minutes', '45 minutes', '60 minutes'],
    required: function () { return this.orderType === 'Takeaway'; } },
  status: { type: String, required: true, enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });
module.exports = mongoose.model('Order', schema);
