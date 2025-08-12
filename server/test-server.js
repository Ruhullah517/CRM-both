const express = require('express');
const { authenticate } = require('./middleware/auth');

// Test basic Express setup
const app = express();
app.use(express.json());

// Test middleware import
console.log('Testing middleware import...');
console.log('authenticate function:', typeof authenticate);

// Test route setup
const router = express.Router();
router.use(authenticate);
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

app.use('/api/test', router);

console.log('Server test setup completed successfully!');
console.log('All imports and middleware are working correctly.');

module.exports = app;
