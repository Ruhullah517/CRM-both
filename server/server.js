const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');
const reportsRouter = require('./routes/reports');
const adobeRoutes = require('./routes/adobe');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Backend Server is running!');
});

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/formf-sessions', require('./routes/formfSessions'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/freelancers', require('./routes/freelancers'));
app.use('/public/freelancers', require('./routes/publicFreelancers'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/email-templates', require('./routes/emailTemplates'));
app.use('/api/contract-templates', require('./routes/contractTemplates'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/reports', reportsRouter);
app.use('/api/adobe', adobeRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
