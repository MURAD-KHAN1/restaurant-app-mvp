const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.protect = async (req, res, next) => {
  try {
    const header = req.get('Authorization');
    const match = typeof header === 'string' && /^Bearer\s+(\S+)$/i.exec(header);
    if (!match) return res.status(401).json({ message: 'Authentication required' });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || typeof payload.id !== 'string' || !/^[a-f\d]{24}$/i.test(payload.id)) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid or expired token' });
    req.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    return next();
  } catch (error) {
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};
exports.managerOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Manager access required' });
  return next();
};

exports.customerOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (req.user.role !== 'customer') return res.status(403).json({ message: 'Customer access required' });
  return next();
};
