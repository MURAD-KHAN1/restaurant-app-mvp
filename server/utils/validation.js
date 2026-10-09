exports.validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
exports.validBody = (body, fields) => body && typeof body === 'object' && !Array.isArray(body)
  && Object.keys(body).every(key => fields.includes(key));
exports.respondError = (res, error) => {
  if (error.code === 11000) return res.status(409).json({ message: 'The selected table is already booked for this time.' });
  if (['ValidationError', 'CastError'].includes(error.name)) return res.status(400).json({ message: 'Invalid request data' });
  return res.status(500).json({ message: 'Server error' });
};
exports.validSlot = (date, time) => {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || typeof time !== 'string' || !/^(1[2-9]|2[0-2]):00$/.test(time)) return false;
  const parsed = new Date(date + 'T00:00:00Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  // Restaurant booking times use Pakistan time, independently of the execution host timezone.
  return new Date(date + 'T' + time + ':00+05:00').getTime() >= Date.now() + 60 * 60 * 1000;
};
