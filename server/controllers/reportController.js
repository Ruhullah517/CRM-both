const Case = require('../models/Case');
const Activity = require('../models/Activity');
const User = require('../models/User');
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

module.exports = {
  casesStatusReport,
  caseTypeDistribution,
  outcomeAnalysis,
  caseloadByWorker,
  timeToResolution,
  demographicBreakdown,
  timeLoggedReport,
  invoiceableHoursReport,
  exportReport
}; 