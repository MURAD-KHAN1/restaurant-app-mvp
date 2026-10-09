/* global __dirname */
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const User = require('./models/User');
const data = require('./data/seed-data.json');
// Preserve existing dishes and all other collections; insert missing A1 dishes only.
async function seed() {
  for (const record of data.menuItems) await new MenuItem(record).validate();
  if (mongoose.connection.readyState !== 1) await connectDB();
  await User.init();
  await Table.init();
  await Reservation.init();
  for (const record of data.tables) {
    await new Table(record).validate();
    await Table.updateOne({ tableNumber: record.tableNumber }, { $setOnInsert: record }, { upsert: true, runValidators: true });
  }
  console.log('Tables ready: missing A1 tables inserted; existing bookings preserved');
  for (const record of data.users) {
    if (record.role !== 'customer' && record.role !== 'manager') throw new Error('Invalid demo user role');
    const user = await User.findOne({ email: record.email }).select('+password');
    if (!user) {
      await User.create({ ...record, role: record.role });
    } else if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password)) {
      // Migrate legacy plaintext without replacing credentials or roles.
      user.markModified('password');
      await user.save();
    }
  }
  console.log('Demo users ready: customer and manager; passwords hashed');
  let inserted = 0;
  for (const record of data.menuItems) {
    const result = await MenuItem.updateOne({ name: record.name }, { $setOnInsert: record }, { upsert: true, runValidators: true });
    inserted += result.upsertedCount;
  }
  console.log('Menu seed complete: inserted=' + inserted + ', total=' + await MenuItem.countDocuments());
}
if (require.main === module) seed().catch(() => {
  console.error('Menu seed failed. Check MongoDB connectivity and seed data.');
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
module.exports = seed;
