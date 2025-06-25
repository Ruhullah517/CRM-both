const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Make uploads folder static
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Backend Server is running!');
});

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/formf-sessions', require('./routes/formfSessions'));

app.listen(port, async () => {
  try {
    await db.getConnection();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  console.log(`Server is running on http://localhost:${port}`);
});
