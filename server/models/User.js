const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['customer', 'manager'], default: 'customer' },
}, { timestamps: true });
// Controllers and seed supply plaintext once; document saves hash changed passwords.
schema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});
schema.set('toJSON', { transform: (doc, ret) => { delete ret.password; return ret; } });
module.exports = mongoose.model('User', schema);
