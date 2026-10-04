const mongoose = require('mongoose');
async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in server/.env');
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'restaurant_app', serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
}
module.exports = connectDB;
