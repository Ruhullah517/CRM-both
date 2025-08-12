const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing database connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

db.once('open', () => {
  console.log('Successfully connected to MongoDB!');
  console.log('Database connection test passed.');
  process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('Database connection timeout');
  process.exit(1);
}, 10000);
