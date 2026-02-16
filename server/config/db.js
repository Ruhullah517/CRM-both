const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Workaround for Atlas TLS handshake failure on some Windows/Node builds (SSL alert 80).
// Remove or set to false when using Node 18+ or in production with proper TLS.
const allowInsecureTLS = process.env.MONGODB_INSECURE_TLS === '1';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  ...(allowInsecureTLS && { tlsAllowInvalidCertificates: true }),
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db; 