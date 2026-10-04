/* global __dirname */
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');
const data = require('./data/seed-data.json');
async function seed() {
  try {
    if (data.users.length !== 2 || data.menuItems.length !== 20 || data.tables.length !== 6) throw new Error('Unexpected seed counts');
    for (const record of data.users) await new User(record).validate();
    for (const record of data.menuItems) await new MenuItem(record).validate();
    for (const record of data.tables) await new Table(record).validate();
    const connection = await connectDB();
    if (connection.name !== 'restaurant_app') throw new Error('Refusing to clear another database');
    const models = [User, MenuItem, Table, Reservation, Order];
    await Promise.all(models.map(Model => Model.init()));
    for (const Model of models) await Model.deleteMany({});
    await User.insertMany(data.users);
    await MenuItem.insertMany(data.menuItems);
    await Table.insertMany(data.tables);
    const counts = await Promise.all(models.map(Model => Model.countDocuments()));
    if (counts.join(',') !== '2,20,6,0,0'
      || await User.countDocuments({ role: 'customer' }) !== 1
      || await User.countDocuments({ role: 'manager' }) !== 1) throw new Error('Seed verification failed');
    const collections = await connection.db.listCollections().toArray();
    if (!models.every(Model => collections.some(collection => collection.name === Model.collection.name))) throw new Error('Missing collections');
    console.log('Seed complete: users=2, menuitems=20, tables=6, reservations=0, orders=0');
  } finally { await mongoose.disconnect(); }
}
if (require.main === module) seed().catch(() => {
  console.error('Seed failed. Check server/.env, MongoDB connectivity, and seed data.');
  process.exitCode = 1;
});
module.exports = seed;
