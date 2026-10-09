const { Buffer } = require('node:buffer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
function validInput(body, register) {
  const fields = register ? ['name', 'email', 'password'] : ['email', 'password'];
  return body && typeof body === 'object' && !Array.isArray(body)
    && Object.keys(body).every(key => fields.includes(key))
    && fields.every(key => typeof body[key] === 'string' && body[key].trim())
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    && body.email.trim().length <= 254
    && (!register || (body.name.trim().length <= 100 && body.password.length >= 8))
    && Buffer.byteLength(body.password, 'utf8') <= 72;
}
function session(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return {
    token: jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET,
      { expiresIn: '1d', algorithm: 'HS256' }),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  };
}
function respondError(res, error) {
  if (error.code === 11000) return res.status(409).json({ message: 'Email already registered' });
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid registration data' });
  }
  return res.status(500).json({ message: 'Server error' });
}
exports.register = async (req, res) => {
  try {
    if (!validInput(req.body, true)) return res.status(400).json({ message: 'Invalid registration data' });
    const email = req.body.email.trim().toLowerCase();
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const user = await User.create({ name: req.body.name.trim(), email,
      password: req.body.password, role: 'customer' });
    return res.status(201).json(session(user));
  } catch (error) { return respondError(res, error); }
};
exports.login = async (req, res) => {
  try {
    if (!validInput(req.body, false)) return res.status(400).json({ message: 'Invalid login data' });
    const user = await User.findOne({ email: req.body.email.trim().toLowerCase() }).select('+password');
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.json(session(user));
  } catch (error) { return respondError(res, error); }
};
