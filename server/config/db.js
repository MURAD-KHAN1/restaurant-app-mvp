const mongoose = require('mongoose');
async function connectDB() {
  try {
    if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in server/.env');
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'restaurant_app', serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    const message = String(error.message || error).replace(/mongodb(?:\+srv)?:\/\/[^\s'"<>]+/gi, '[redacted MongoDB URI]');
    console.error('MongoDB connection failed: ' + message);
    process.exit(1);
  }
}
module.exports = connectDB;
