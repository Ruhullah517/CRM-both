const dotenv = require('dotenv');
const path = require('path');
const result = dotenv.config({ path: path.join(__dirname, '.env') });
if (result.error) {
  console.log('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
  console.log('NODE_ENV:', process.env.NODE_ENV ? 'Found' : 'Not found');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? 'Found' : 'Not found');
}
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { getFrontendUrl } = require('./config/urls');
const reportsRouter = require('./routes/reports');
const adobeRoutes = require('./routes/adobe');
const { initializeCronJobs } = require('./services/cronJobs');
const { ensureLogosInUploads } = require('./utils/logoResolver');


const app = express();
const port = 5000;

// CORS configuration - Uses centralized URL config
const frontendUrl = getFrontendUrl();
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      frontendUrl, // Uses centralized config
      frontendUrl.replace('http://', 'https://'), // HTTPS version
      frontendUrl.replace('https://', 'http://'), // HTTP version (if HTTPS was set)
      'http://crm.blackfostercarersalliance.co.uk', // Explicit HTTP production
      'https://crm.blackfostercarersalliance.co.uk', // Explicit HTTPS production
    ].filter(Boolean); // Remove any undefined/null values
    
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}. Allowed:`, allowedOrigins);
      callback(null, true); // Allow all for now, change to new Error('Not allowed by CORS') if you want to restrict
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/emails', require('./routes/emails'));
app.use('/api/email-automations', require('./routes/emailAutomations'));
app.use('/api/gdpr', require('./routes/gdpr'));
app.use('/api/contract-templates', require('./routes/contractTemplates'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/reports', reportsRouter);
app.use('/api/adobe', adobeRoutes);
// Training, Invoices, Calendar, Feedback, and Export routes
// Public intake for WordPress enquiries (no auth). Mounted both at root and under /api
app.use('/public/enquiries', require('./routes/publicEnquiries'));
app.use('/api/public/enquiries', require('./routes/publicEnquiries'));
// Public intake for WordPress cultural mentoring / mentee candidates (no auth)
app.use('/public/candidates', require('./routes/publicCandidates'));
app.use('/api/public/candidates', require('./routes/publicCandidates'));
app.use('/api/training', require('./routes/training'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/invoice-settings', require('./routes/invoiceSettings'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/exports', require('./routes/exports'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/leads', require('./routes/leads')); // Public API for website lead capture


app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log(`Frontend URL configured: ${frontendUrl}`);
  
  // Ensure logo files are available in uploads folder (for production)
  ensureLogosInUploads();
  
  // Initialize cron jobs for HR module
  initializeCronJobs();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
