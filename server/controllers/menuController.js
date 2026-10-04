const MenuItem = require('../models/MenuItem');
const fields = { name: 'string', description: 'string', category: 'string', price: 'number',
  image: 'string', available: 'boolean', isSpecial: 'boolean' };
function validBody(body) {
  return body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length > 0
    && Object.entries(body).every(([key, value]) => Object.hasOwn(fields, key)
      && typeof value === fields[key] && (key !== 'price' || Number.isFinite(value)));
}
function validId(id) { return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id); }
function respondError(res, err) {
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: 'Validation failed' });
  return res.status(500).json({ message: 'Server error' });
}
exports.getMenuItems = async (req, res) => {
  try {
    const filter = {};
    for (const key of Object.keys(req.query)) {
      if (!['category', 'search'].includes(key) || typeof req.query[key] !== 'string') return res.status(400).json({ message: 'Invalid query parameters' });
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.name = { $regex: req.query.search.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&'), $options: 'i' };
    }
    return res.json(await MenuItem.find(filter));
  } catch (err) { return respondError(res, err); }
};
exports.getMenuItemById = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid menu item ID' });
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.json(item);
  } catch (err) { return respondError(res, err); }
};
exports.createMenuItem = async (req, res) => {
  try {
    if (!validBody(req.body)) return res.status(400).json({ message: 'Invalid menu item fields' });
    return res.status(201).json(await MenuItem.create(req.body));
  } catch (err) { return respondError(res, err); }
};
exports.updateMenuItem = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid menu item ID' });
    if (!validBody(req.body)) return res.status(400).json({ message: 'Invalid menu item fields' });
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.json(item);
  } catch (err) { return respondError(res, err); }
};
exports.deleteMenuItem = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid menu item ID' });
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.json({ message: 'Menu item deleted successfully' });
  } catch (err) { return respondError(res, err); }
};
