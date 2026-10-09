/* global __dirname */
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  return res.status(500).json({ message: 'Server error' });
});
async function start() {
  if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in server/.env');
  await connectDB();
  await require('./models/Reservation').init();
  return app.listen(process.env.PORT || 5000, '0.0.0.0', () => console.log('Server running at http://localhost:' + (process.env.PORT || 5000)));
}
if (require.main === module) start().catch(() => {
  console.error('Server startup failed. Check server/.env and MongoDB connectivity.');
  process.exitCode = 1;
});
module.exports = app;
module.exports.start = start;
