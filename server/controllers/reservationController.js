const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { validId, validBody, validSlot, respondError } = require('../utils/validation');
exports.createReservation = async (req, res) => {
  try {
    const body = req.body;
    if (!validBody(body, ['table', 'date', 'time', 'partySize', 'phone', 'customerName'])
      || !validId(body.table) || !validSlot(body.date, body.time)
      || !Number.isInteger(body.partySize) || body.partySize < 1 || body.partySize > 12
      || typeof body.phone !== 'string' || !/^03\d{2}-\d{7}$/.test(body.phone)
      || (body.customerName !== undefined && (typeof body.customerName !== 'string' || !body.customerName.trim() || body.customerName.trim().length > 100))) {
      return res.status(400).json({ message: 'Invalid reservation data; use a valid slot at least one hour ahead.' });
    }
    const table = await Table.findById(body.table);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (!table.available) return res.status(400).json({ message: 'Table is unavailable' });
    if (body.partySize > table.seats) return res.status(400).json({ message: 'The table does not have enough seats.' });
    if (await Reservation.exists({ table: table._id, date: body.date, time: body.time, status: { $in: ['Pending', 'Accepted'] } })) {
      return res.status(409).json({ message: 'The selected table is already booked for this time.' });
    }
    const reservation = await Reservation.create({ user: req.user._id, table: table._id, date: body.date,
      time: body.time, partySize: body.partySize, phone: body.phone,
      customerName: body.customerName?.trim() || req.user.name, customerEmail: req.user.email });
    return res.status(201).json(await reservation.populate('table'));
  } catch (error) { return respondError(res, error); }
};
exports.getMyReservations = async (req, res) => {
  try { return res.json(await Reservation.find({ user: req.user._id }).populate('table').sort({ createdAt: -1, _id: -1 })); }
  catch (error) { return respondError(res, error); }
};
exports.getReservations = async (req, res) => {
  try { return res.json(await Reservation.find({}).populate('table').sort({ createdAt: -1, _id: -1 })); }
  catch (error) { return respondError(res, error); }
};
exports.updateReservation = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid reservation ID' });
    if (!validBody(req.body, ['status']) || !['Accepted', 'Declined', 'Cancelled'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid reservation status' });
    }
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    const owner = String(reservation.user) === String(req.user._id);
    if (req.user.role !== 'manager' && !(req.body.status === 'Cancelled' && owner)) {
      return res.status(403).json({ message: 'Manager access required' });
    }
    const allowed = reservation.status === 'Pending' ? ['Accepted', 'Declined', 'Cancelled']
      : reservation.status === 'Accepted' ? ['Cancelled'] : [];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Illegal reservation status transition' });
    const updated = await Reservation.findOneAndUpdate({ _id: reservation._id, status: reservation.status },
      { $set: { status: req.body.status } }, { returnDocument: 'after', runValidators: true }).populate('table');
    if (!updated) return res.status(400).json({ message: 'Reservation changed. Refresh and try again.' });
    return res.json(updated);
  } catch (error) { return respondError(res, error); }
};
exports.getTables = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;
    if (Object.keys(req.query).some(key => !['date', 'time', 'partySize'].includes(key))) {
      return res.status(400).json({ message: 'Invalid table query' });
    }
    const filter = { available: true };
    if (date !== undefined || time !== undefined || partySize !== undefined) {
      if (!validSlot(date, time) || typeof partySize !== 'string' || !/^([1-9]|1[0-2])$/.test(partySize)) {
        return res.status(400).json({ message: 'Invalid table availability query' });
      }
      const bookings = await Reservation.find({ date, time, status: { $in: ['Pending', 'Accepted'] } }).select('table');
      filter._id = { $nin: bookings.map(booking => booking.table) };
      filter.seats = { $gte: Number(partySize) };
    }
    return res.json(await Table.find(filter).sort({ tableNumber: 1 }));
  } catch (error) { return respondError(res, error); }
};
