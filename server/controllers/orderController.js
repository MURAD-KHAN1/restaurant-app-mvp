const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const { validId, validBody, respondError } = require('../utils/validation');
const transitions = { Pending: ['Preparing', 'Cancelled'], Preparing: ['Ready'], Ready: ['Served'], Served: [], Cancelled: [] };
const promotions = { WELCOME10: 10, FEAST20: 20 };
exports.createOrder = async (req, res) => {
  try {
    const body = req.body;
    if (!validBody(body, ['items', 'orderType', 'table', 'pickupTime', 'promoCode', 'total', 'subtotal', 'totals', 'discount', 'serviceCharge', 'salesTax'])
      || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50
      || !['Dine-in', 'Takeaway'].includes(body.orderType)) return res.status(400).json({ message: 'Invalid order data' });
    const seen = new Set();
    for (const item of body.items) {
      if (!validBody(item, ['menuItem', 'quantity', 'note', 'price', 'unitPrice', 'name']) || !validId(item.menuItem)
        || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
        || (item.note !== undefined && (typeof item.note !== 'string' || item.note.length > 500))
        || seen.has(item.menuItem.toLowerCase())) return res.status(400).json({ message: 'Invalid order items' });
      seen.add(item.menuItem.toLowerCase());
    }
    let table = null;
    if (body.orderType === 'Dine-in') {
      if (!validId(body.table)) return res.status(400).json({ message: 'Invalid table ID' });
      table = await Table.findById(body.table);
      if (!table) return res.status(404).json({ message: 'Table not found' });
      if (!table.available) return res.status(400).json({ message: 'Table is unavailable' });
    } else if (!['15 minutes', '30 minutes', '45 minutes', '60 minutes'].includes(body.pickupTime)) {
      return res.status(400).json({ message: 'Invalid pickup time' });
    }
    const promoCode = body.promoCode === undefined ? '' : body.promoCode;
    if (typeof promoCode !== 'string' || (promoCode && !Object.hasOwn(promotions, promoCode))) {
      return res.status(400).json({ message: 'Invalid promo code' });
    }
    const menu = await MenuItem.find({ _id: { $in: body.items.map(item => item.menuItem) } });
    const items = [];
    let subtotalCents = 0;
    // The server recalculates totals from database prices so a client cannot manipulate prices/totals.
    for (const requested of body.items) {
      const item = menu.find(item => String(item._id) === requested.menuItem.toLowerCase());
      if (!item) return res.status(404).json({ message: 'Menu item not found' });
      if (!item.available) return res.status(400).json({ message: item.name + ' is unavailable' });
      const priceCents = Math.round(item.price * 100);
      subtotalCents += priceCents * requested.quantity;
      items.push({ menuItem: item._id, name: item.name, unitPrice: priceCents / 100,
        quantity: requested.quantity, note: requested.note || '' });
    }
    const serviceCents = Math.round(subtotalCents * 0.05);
    const taxCents = Math.round(subtotalCents * 0.15);
    const discountCents = Math.round(subtotalCents * ((promotions[promoCode] || 0) / 100));
    const order = await Order.create({ user: req.user._id, customerName: req.user.name,
      customerEmail: req.user.email, items, subtotal: subtotalCents / 100,
      serviceCharge: serviceCents / 100, salesTax: taxCents / 100, discount: discountCents / 100,
      total: (subtotalCents + serviceCents + taxCents - discountCents) / 100,
      promoCode: /** @type {'' | 'WELCOME10' | 'FEAST20'} */ (promoCode), orderType: body.orderType, table: table?._id || null,
      pickupTime: body.orderType === 'Takeaway' ? body.pickupTime : null });
    return res.status(201).json(await order.populate('table'));
  } catch (error) { return respondError(res, error); }
};
exports.getMyOrders = async (req, res) => {
  try { return res.json(await Order.find({ user: req.user._id }).populate('table').sort({ createdAt: -1, _id: -1 })); }
  catch (error) { return respondError(res, error); }
};
exports.getOrders = async (req, res) => {
  try { return res.json(await Order.find({}).populate('table').sort({ createdAt: -1, _id: -1 })); }
  catch (error) { return respondError(res, error); }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid order ID' });
    if (!validBody(req.body, ['status']) || !Object.hasOwn(transitions, req.body.status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!transitions[order.status].includes(req.body.status)) return res.status(400).json({ message: 'Illegal order status transition' });
    // Compare the old status atomically so concurrent managers cannot overwrite newer progress.
    const updated = await Order.findOneAndUpdate({ _id: order._id, status: order.status },
      { $set: { status: req.body.status } }, { returnDocument: 'after', runValidators: true }).populate('table');
    if (!updated) return res.status(400).json({ message: 'Order status changed. Refresh and try again.' });
    return res.json(updated);
  } catch (error) { return respondError(res, error); }
};
