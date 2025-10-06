const cron = require('node-cron');
const { runComplianceChecks } = require('./complianceAlerts');

// Schedule compliance checks to run daily at 9 AM
const scheduleComplianceChecks = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled compliance checks...');
    try {
      const results = await runComplianceChecks();
      console.log(`Scheduled compliance check completed: ${results.totalAlerts} total alerts`);
    } catch (error) {
      console.error('Error in scheduled compliance check:', error);
    }
  }, {
    scheduled: true,
    timezone: "Europe/London"
  });

  console.log('Compliance checks scheduled to run daily at 9:00 AM');
};

// Schedule weekly summary reports
const scheduleWeeklyReports = () => {
  // Run every Monday at 10:00 AM
  cron.schedule('0 10 * * 1', async () => {
    console.log('Running weekly HR summary report...');
    try {
      // You can add weekly reporting logic here
      console.log('Weekly HR summary report completed');
    } catch (error) {
      console.error('Error in weekly HR report:', error);
    }
  }, {
    scheduled: true,
    timezone: "Europe/London"
  });

  console.log('Weekly reports scheduled to run every Monday at 10:00 AM');
};

// Initialize all scheduled jobs
const initializeCronJobs = () => {
  scheduleComplianceChecks();
  scheduleWeeklyReports();
  console.log('All cron jobs initialized successfully');
};

module.exports = {
  scheduleComplianceChecks,
  scheduleWeeklyReports,
  initializeCronJobs
};
