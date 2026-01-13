const Case = require('../models/Case');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Contract = require('../models/Contract');
const Enquiry = require('../models/Enquiry');
const Invoice = require('../models/Invoice');
const TrainingEvent = require('../models/TrainingEvent');
const Mentor = require('../models/Mentor');
const MentorActivity = require('../models/MentorActivity');
const { Parser } = require('json2csv');

// Open/Closed cases by date
const casesStatusReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const matchOpened = {};
    const matchClosed = {};
    if (start) {
      matchOpened['keyDates.opened'] = { $gte: new Date(start) };
      matchClosed['keyDates.closed'] = { $gte: new Date(start) };
    }
    if (end) {
      matchOpened['keyDates.opened'] = { ...(matchOpened['keyDates.opened'] || {}), $lte: new Date(end) };
      matchClosed['keyDates.closed'] = { ...(matchClosed['keyDates.closed'] || {}), $lte: new Date(end) };
    }
    // Opened cases by date
    const opened = await Case.aggregate([
      { $match: { ...matchOpened, 'keyDates.opened': { $ne: null } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$keyDates.opened' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    // Closed cases by date
    const closed = await Case.aggregate([
      { $match: { ...matchClosed, 'keyDates.closed': { $ne: null } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$keyDates.closed' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      opened: opened.map(o => ({ date: o._id, count: o.count })),
      closed: closed.map(c => ({ date: c._id, count: c.count }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Case type distribution
const caseTypeDistribution = async (req, res) => {
  try {
    const distribution = await Case.aggregate([
      { $match: { caseType: { $ne: null } } },
      { $group: {
        _id: '$caseType',
        count: { $sum: 1 }
      } },
      { $sort: { count: -1 } }
    ]);
    res.json(distribution.map(d => ({ caseType: d._id, count: d.count })));
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Outcome analysis
const outcomeAnalysis = async (req, res) => {
  try {
    const outcomes = await Case.aggregate([
      { $match: { outcomeAchieved: { $ne: null } } },
      { $group: {
        _id: '$outcomeAchieved',
        count: { $sum: 1 }
      } },
      { $sort: { count: -1 } }
    ]);
    res.json(outcomes.map(o => ({ outcome: o._id, count: o.count })));
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Caseload by worker
const caseloadByWorker = async (req, res) => {
  try {
    // Unwind assignedCaseworkers array
    const caseload = await Case.aggregate([
      { $unwind: '$assignedCaseworkers' },
      { $group: {
        _id: {
          userId: '$assignedCaseworkers.userId',
          isLead: '$assignedCaseworkers.isLead'
        },
        count: { $sum: 1 }
      } },
      { $lookup: {
        from: 'users',
        localField: '_id.userId',
        foreignField: '_id',
        as: 'user'
      } },
      { $unwind: '$user' },
      { $project: {
        _id: 0,
        userId: '$_id.userId',
        isLead: '$_id.isLead',
        name: '$user.name',
        email: '$user.email',
        count: 1
      } },
      { $sort: { count: -1 } }
    ]);
    res.json(caseload);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Time to resolution
const timeToResolution = async (req, res) => {
  try {
    // Only consider cases with both opened and closed dates
    const cases = await Case.aggregate([
      { $match: { 'keyDates.opened': { $ne: null }, 'keyDates.closed': { $ne: null } } },
      { $project: {
        opened: '$keyDates.opened',
        closed: '$keyDates.closed',
        diffDays: {
          $divide: [
            { $subtract: ['$keyDates.closed', '$keyDates.opened'] },
            1000 * 60 * 60 * 24
          ]
        }
      } }
    ]);
    const total = cases.length;
    const avg = total > 0 ? (cases.reduce((sum, c) => sum + c.diffDays, 0) / total) : 0;
    res.json({
      averageDays: avg,
      total,
      distribution: cases.map(c => ({ opened: c.opened, closed: c.closed, days: c.diffDays }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Demographic breakdowns
const demographicBreakdown = async (req, res) => {
  try {
    // Gender breakdown
    const gender = await Case.aggregate([
      { $match: { gender: { $ne: null } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Ethnicity breakdown
    const ethnicity = await Case.aggregate([
      { $match: { ethnicity: { $ne: null } } },
      { $group: { _id: '$ethnicity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({
      gender: gender.map(g => ({ gender: g._id, count: g.count })),
      ethnicity: ethnicity.map(e => ({ ethnicity: e._id, count: e.count }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Total time logged per caseworker / per client
const timeLoggedReport = async (req, res) => {
  try {
    // Per caseworker
    const perCaseworker = await Activity.aggregate([
      { $match: { timeSpent: { $ne: null, $ne: '00:00' } } },
      { $group: {
        _id: '$caseworker',
        totalMinutes: {
          $sum: {
            $add: [
              { $multiply: [
                { $toInt: { $arrayElemAt: [ { $split: ['$timeSpent', ':'] }, 0 ] } }, 60
              ] },
              { $toInt: { $arrayElemAt: [ { $split: ['$timeSpent', ':'] }, 1 ] } }
            ]
          }
        }
      } },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      } },
      { $unwind: '$user' },
      { $project: {
        _id: 0,
        caseworkerId: '$_id',
        name: '$user.name',
        email: '$user.email',
        totalMinutes: 1
      } },
      { $sort: { totalMinutes: -1 } }
    ]);
    // Per client (by case)
    const perClient = await Activity.aggregate([
      { $match: { timeSpent: { $ne: null, $ne: '00:00' } } },
      { $lookup: {
        from: 'cases',
        localField: 'caseId',
        foreignField: '_id',
        as: 'case'
      } },
      { $unwind: '$case' },
      { $group: {
        _id: '$case._id',
        clientFullName: { $first: '$case.clientFullName' },
        totalMinutes: {
          $sum: {
            $add: [
              { $multiply: [
                { $toInt: { $arrayElemAt: [ { $split: ['$timeSpent', ':'] }, 0 ] } }, 60
              ] },
              { $toInt: { $arrayElemAt: [ { $split: ['$timeSpent', ':'] }, 1 ] } }
            ]
          }
        }
      } },
      { $sort: { totalMinutes: -1 } }
    ]);
    res.json({
      perCaseworker,
      perClient
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Invoiceable hours summary
const invoiceableHoursReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = { invoiceableHours: { $ne: null, $ne: '00:00' } };
    if (start) match['keyDates.opened'] = { $gte: new Date(start) };
    if (end) match['keyDates.opened'] = { ...(match['keyDates.opened'] || {}), $lte: new Date(end) };
    // By case type and caseworker
    const summary = await Case.aggregate([
      { $match: match },
      { $unwind: '$assignedCaseworkers' },
      { $group: {
        _id: {
          caseType: '$caseType',
          caseworker: '$assignedCaseworkers.userId'
        },
        totalMinutes: {
          $sum: {
            $add: [
              { $multiply: [
                { $toInt: { $arrayElemAt: [ { $split: ['$invoiceableHours', ':'] }, 0 ] } }, 60
              ] },
              { $toInt: { $arrayElemAt: [ { $split: ['$invoiceableHours', ':'] }, 1 ] } }
            ]
          }
        }
      } },
      { $lookup: {
        from: 'users',
        localField: '_id.caseworker',
        foreignField: '_id',
        as: 'user'
      } },
      { $unwind: '$user' },
      { $project: {
        _id: 0,
        caseType: '$_id.caseType',
        caseworkerId: '$_id.caseworker',
        name: '$user.name',
        email: '$user.email',
        totalMinutes: 1
      } },
      { $sort: { caseType: 1, name: 1 } }
    ]);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Export report (CSV/PDF)
const exportReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { report } = req.query;
    let data = [];
    // Call the appropriate report function
    switch (report) {
      case 'cases-status': {
        const result = await casesStatusReport({ query: req.query }, { json: d => d });
        data = [
          ...result.opened.map(o => ({ status: 'Opened', ...o })),
          ...result.closed.map(c => ({ status: 'Closed', ...c }))
        ];
        break;
      }
      case 'case-type-distribution': {
        const result = await caseTypeDistribution({ query: req.query }, { json: d => d });
        data = result;
        break;
      }
      case 'outcome-analysis': {
        const result = await outcomeAnalysis({ query: req.query }, { json: d => d });
        data = result;
        break;
      }
      case 'caseload-by-worker': {
        const result = await caseloadByWorker({ query: req.query }, { json: d => d });
        data = result;
        break;
      }
      case 'time-to-resolution': {
        const result = await timeToResolution({ query: req.query }, { json: d => d });
        data = result.distribution;
        break;
      }
      case 'demographics': {
        const result = await demographicBreakdown({ query: req.query }, { json: d => d });
        data = [
          ...result.gender.map(g => ({ type: 'Gender', ...g })),
          ...result.ethnicity.map(e => ({ type: 'Ethnicity', ...e }))
        ];
        break;
      }
      case 'time-logged': {
        const result = await timeLoggedReport({ query: req.query }, { json: d => d });
        data = [
          ...result.perCaseworker.map(cw => ({ type: 'Caseworker', ...cw })),
          ...result.perClient.map(cl => ({ type: 'Client', ...cl }))
        ];
        break;
      }
      case 'invoiceable-hours': {
        const result = await invoiceableHoursReport({ query: req.query }, { json: d => d });
        data = result;
        break;
      }
      default:
        return res.status(400).json({ error: 'Unknown report type' });
    }
    // Export as CSV
    if (type === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${report}.csv`);
      return res.send(csv);
    }
    // PDF export not implemented
    return res.status(400).json({ error: 'Only CSV export is supported at this time.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Freelancer work hours and earnings report
const freelancerWorkReport = async (req, res) => {
  try {
    const freelancers = await Freelancer.find({ status: 'approved' });
    
    const report = freelancers.map(freelancer => {
      const workHistory = freelancer.workHistory || [];
      const completedWork = workHistory.filter(w => w.status === 'completed');
      const inProgressWork = workHistory.filter(w => w.status === 'in_progress');
      
      const totalHours = workHistory.reduce((sum, w) => sum + (w.hours || 0), 0);
      const totalEarnings = workHistory.reduce((sum, w) => sum + (w.totalAmount || 0), 0);
      const completedHours = completedWork.reduce((sum, w) => sum + (w.hours || 0), 0);
      const completedEarnings = completedWork.reduce((sum, w) => sum + (w.totalAmount || 0), 0);
      
      return {
        freelancerId: freelancer._id,
        name: freelancer.fullName,
        email: freelancer.email,
        hourlyRate: freelancer.hourlyRate || 0,
        dailyRate: freelancer.dailyRate || 0,
        availability: freelancer.availability,
        totalAssignments: workHistory.length,
        completedAssignments: completedWork.length,
        inProgressAssignments: inProgressWork.length,
        totalHours,
        completedHours,
        totalEarnings,
        completedEarnings,
        roles: freelancer.roles || []
      };
    });
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Contract status breakdown
const contractStatusReport = async (req, res) => {
  try {
    const contracts = await Contract.find();
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const statusBreakdown = {
      active: 0,
      expiringSoon: 0, // expires within 30 days
      expired: 0,
      draft: 0,
      total: contracts.length
    };
    
    const expiringContracts = [];
    
    contracts.forEach(contract => {
      if (contract.status === 'draft') {
        statusBreakdown.draft++;
      } else if (contract.endDate) {
        const endDate = new Date(contract.endDate);
        if (endDate < now) {
          statusBreakdown.expired++;
        } else if (endDate <= thirtyDaysFromNow) {
          statusBreakdown.expiringSoon++;
          expiringContracts.push({
            contractId: contract._id,
            title: contract.title,
            clientName: contract.clientName,
            endDate: contract.endDate,
            daysRemaining: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
          });
        } else {
          statusBreakdown.active++;
        }
      } else {
        statusBreakdown.active++;
      }
    });
    
    res.json({
      statusBreakdown,
      expiringContracts: expiringContracts.sort((a, b) => a.daysRemaining - b.daysRemaining)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Recruitment pipeline analytics
const recruitmentPipelineReport = async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    
    const pipelineStats = {
      Enquiry: 0,
      Application: 0,
      Assessment: 0,
      Mentoring: 0,
      Approval: 0,
      total: enquiries.length
    };
    
    const statusBreakdown = {
      Active: 0,
      Paused: 0,
      Approved: 0,
      Rejected: 0,
      Withdrawn: 0
    };
    
    enquiries.forEach(enquiry => {
      // Count by stage
      if (enquiry.stage) {
        pipelineStats[enquiry.stage] = (pipelineStats[enquiry.stage] || 0) + 1;
      }
      
      // Count by status
      if (enquiry.status) {
        statusBreakdown[enquiry.status] = (statusBreakdown[enquiry.status] || 0) + 1;
      }
    });
    
    // Calculate conversion rates
    const conversionRates = {
      enquiryToApplication: pipelineStats.Enquiry > 0 
        ? ((pipelineStats.Application + pipelineStats.Assessment + pipelineStats.Mentoring + pipelineStats.Approval) / pipelineStats.total * 100).toFixed(1)
        : 0,
      applicationToAssessment: (pipelineStats.Application + pipelineStats.Assessment + pipelineStats.Mentoring + pipelineStats.Approval) > 0
        ? ((pipelineStats.Assessment + pipelineStats.Mentoring + pipelineStats.Approval) / (pipelineStats.Application + pipelineStats.Assessment + pipelineStats.Mentoring + pipelineStats.Approval) * 100).toFixed(1)
        : 0,
      assessmentToApproval: (pipelineStats.Assessment + pipelineStats.Mentoring + pipelineStats.Approval) > 0
        ? (pipelineStats.Approval / (pipelineStats.Assessment + pipelineStats.Mentoring + pipelineStats.Approval) * 100).toFixed(1)
        : 0,
      overallConversion: pipelineStats.total > 0
        ? (pipelineStats.Approval / pipelineStats.total * 100).toFixed(1)
        : 0
    };
    
    res.json({
      pipelineStats,
      statusBreakdown,
      conversionRates
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Invoice and revenue analytics
const invoiceRevenueReport = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    
    const revenueStats = {
      totalInvoiced: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      invoiceCount: invoices.length,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0
    };
    
    const monthlyRevenue = {};
    
    invoices.forEach(invoice => {
      const amount = invoice.total || 0;
      revenueStats.totalInvoiced += amount;
      
      if (invoice.status === 'paid') {
        revenueStats.totalPaid += amount;
        revenueStats.paidCount++;
      } else if (invoice.status === 'overdue') {
        revenueStats.totalOverdue += amount;
        revenueStats.overdueCount++;
      } else {
        revenueStats.totalPending += amount;
        revenueStats.pendingCount++;
      }
      
      // Group by month
      if (invoice.issuedDate) {
        const monthKey = new Date(invoice.issuedDate).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = {
            month: monthKey,
            invoiced: 0,
            paid: 0,
            count: 0
          };
        }
        monthlyRevenue[monthKey].invoiced += amount;
        if (invoice.status === 'paid') {
          monthlyRevenue[monthKey].paid += amount;
        }
        monthlyRevenue[monthKey].count++;
      }
    });
    
    const monthlyData = Object.values(monthlyRevenue).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6);
    
    res.json({
      revenueStats,
      monthlyRevenue: monthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Training events analytics
const trainingEventsReport = async (req, res) => {
  try {
    const events = await TrainingEvent.find().populate('trainer', 'name');
    const now = new Date();
    
    const stats = {
      totalEvents: events.length,
      upcomingEvents: 0,
      completedEvents: 0,
      cancelledEvents: 0,
      draftEvents: 0,
      totalParticipants: 0,
      averageAttendance: 0
    };
    
    const upcomingEventsList = [];
    
    events.forEach(event => {
      const startDate = new Date(event.startDate);
      
      if (event.status === 'cancelled') {
        stats.cancelledEvents++;
      } else if (event.status === 'draft') {
        stats.draftEvents++;
      } else if (event.status === 'completed' || startDate < now) {
        stats.completedEvents++;
      } else {
        stats.upcomingEvents++;
        if (upcomingEventsList.length < 10) {
          upcomingEventsList.push({
            eventId: event._id,
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            trainer: event.trainer?.name || 'Not assigned',
            maxParticipants: event.maxParticipants,
            price: event.price
          });
        }
      }
    });
    
    // Sort upcoming events by date
    upcomingEventsList.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    res.json({
      stats,
      upcomingEvents: upcomingEventsList
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Mentor assignments and activity report
const mentorReport = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    
    const report = await Promise.all(mentors.map(async (mentor) => {
      // Get assignments for this mentor
      const assignments = await MentorActivity.find({
        mentorId: mentor._id,
        activityType: 'assignment'
      }).populate('enquiryId', 'full_name status');
      
      // Get activity logs for assignments
      const assignmentIds = assignments.map(a => a._id);
      const logs = await MentorActivity.find({
        mentorId: mentor._id,
        parentAssignmentId: { $in: assignmentIds },
        activityType: 'assignment_log'
      });
      
      // Get enquiries assigned to this mentor
      const enquiries = await Enquiry.find({
        'mentorAllocation.mentorId': mentor._id
      });
      
      const activeAssignments = assignments.filter(a => a.status === 'active' || !a.status);
      const completedAssignments = assignments.filter(a => a.status === 'completed');
      
      return {
        mentorId: mentor._id,
        name: mentor.name,
        email: mentor.email,
        phone: mentor.phone,
        status: mentor.status || 'Active',
        specialization: mentor.specialization || '',
        totalAssignments: assignments.length,
        activeAssignments: activeAssignments.length,
        completedAssignments: completedAssignments.length,
        totalActivityLogs: logs.length,
        assignedEnquiries: enquiries.length,
        skills: mentor.skills || []
      };
    }));
    
    const stats = {
      totalMentors: mentors.length,
      activeMentors: mentors.filter(m => m.status === 'Active').length,
      inactiveMentors: mentors.filter(m => m.status === 'Inactive').length,
      onLeaveMentors: mentors.filter(m => m.status === 'On Leave').length,
      totalAssignments: report.reduce((sum, r) => sum + r.totalAssignments, 0),
      activeAssignments: report.reduce((sum, r) => sum + r.activeAssignments, 0),
      completedAssignments: report.reduce((sum, r) => sum + r.completedAssignments, 0),
      totalActivityLogs: report.reduce((sum, r) => sum + r.totalActivityLogs, 0),
      totalAssignedEnquiries: report.reduce((sum, r) => sum + r.assignedEnquiries, 0)
    };
    
    res.json({
      stats,
      mentors: report.sort((a, b) => b.totalAssignments - a.totalAssignments)
    });
  } catch (error) {
    console.error('Error generating mentor report:', error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  casesStatusReport,
  caseTypeDistribution,
  outcomeAnalysis,
  caseloadByWorker,
  timeToResolution,
  demographicBreakdown,
  timeLoggedReport,
  invoiceableHoursReport,
  exportReport,
  freelancerWorkReport,
  contractStatusReport,
  recruitmentPipelineReport,
  invoiceRevenueReport,
  trainingEventsReport,
  mentorReport
}; 