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
const PDFDocument = require('pdfkit');

// Helper to get default 1-year date range
const getDefaultDateRange = (start, end) => {
  let startDate = start ? new Date(start) : null;
  let endDate = end ? new Date(end) : null;

  // If no explicit range provided, default to last 12 months
  if (!startDate && !endDate) {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    startDate = oneYearAgo;
    endDate = now;
  }

  return { startDate, endDate };
};

// Helper to send tabular data as a simple PDF (title + table)
// Renders a basic grid with borders; uses smaller font sizes to fit content.
const sendTableAsPdf = (res, title, rows, filename) => {
  // Minimal side margins so the table gets more width; smaller top/bottom for more vertical space
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 30, bottom: 30, left: 20, right: 20 }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const pageWidth = right - left;
  const lineWidth = 0.25;

  // Smaller title and body text
  doc.fontSize(12).text(title, { align: 'left' });
  doc.moveDown(0.5);

  if (!rows || rows.length === 0) {
    doc.fontSize(9).text('No data available for this report.', { align: 'left' });
    doc.end();
    return;
  }

  const columns = Object.keys(rows[0]);
  const colWidth = pageWidth / columns.length;
  const cellPadding = 3;

  let y = doc.y;

  const ensureSpaceForRow = (rowHeight) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
  };

  const drawRowBorder = (rowTop, rowHeight) => {
    doc.lineWidth(lineWidth).strokeColor('#333');
    // Top
    doc.moveTo(left, rowTop).lineTo(right, rowTop).stroke();
    // Bottom
    doc.moveTo(left, rowTop + rowHeight).lineTo(right, rowTop + rowHeight).stroke();
    // Vertical lines between columns
    for (let i = 0; i <= columns.length; i++) {
      const x = left + i * colWidth;
      doc.moveTo(x, rowTop).lineTo(x, rowTop + rowHeight).stroke();
    }
  };

  doc.fontSize(8);

  // Header row
  const headerLabels = columns.map(col => col.charAt(0).toUpperCase() + col.slice(1));
  const headerHeight = Math.max(
    14,
    ...headerLabels.map(label => doc.heightOfString(label, { width: colWidth - cellPadding * 2 }))
  ) + cellPadding * 2;

  ensureSpaceForRow(headerHeight);
  const headerTop = y;
  drawRowBorder(headerTop, headerHeight);

  columns.forEach((col, idx) => {
    const label = headerLabels[idx];
    const x = left + idx * colWidth + cellPadding;
    doc.text(label, x, y + cellPadding, {
      width: colWidth - cellPadding * 2,
      align: 'left'
    });
  });
  y += headerHeight;

  // Data rows
  rows.forEach(row => {
    const normalized = {};
    let rowHeight = 0;

    columns.forEach(col => {
      let value = row[col];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'number') {
        value = Number.isFinite(value) ? value.toString() : '';
      } else if (value instanceof Date) {
        value = value.toISOString();
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      const text = String(value);
      normalized[col] = text;
      const h = doc.heightOfString(text, { width: colWidth - cellPadding * 2 });
      if (h > rowHeight) rowHeight = h;
    });

    rowHeight += cellPadding * 2;
    ensureSpaceForRow(rowHeight);

    const rowTop = y;
    drawRowBorder(rowTop, rowHeight);

    columns.forEach((col, idx) => {
      const x = left + idx * colWidth + cellPadding;
      doc.text(normalized[col], x, y + cellPadding, {
        width: colWidth - cellPadding * 2,
        align: 'left'
      });
    });

    y += rowHeight;
  });

  doc.end();
};

// Open/Closed cases by date (defaults to last year)
const casesStatusReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { startDate, endDate } = getDefaultDateRange(start, end);

    const matchOpened = {};
    const matchClosed = {};
    if (startDate) {
      matchOpened['keyDates.opened'] = { $gte: startDate };
      matchClosed['keyDates.closed'] = { $gte: startDate };
    }
    if (endDate) {
      matchOpened['keyDates.opened'] = { ...(matchOpened['keyDates.opened'] || {}), $lte: endDate };
      matchClosed['keyDates.closed'] = { ...(matchClosed['keyDates.closed'] || {}), $lte: endDate };
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

// Invoiceable hours summary (defaults to last year)
const invoiceableHoursReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { startDate, endDate } = getDefaultDateRange(start, end);

    const match = { invoiceableHours: { $ne: null, $ne: '00:00' } };
    if (startDate) match['keyDates.opened'] = { $gte: startDate };
    if (endDate) match['keyDates.opened'] = { ...(match['keyDates.opened'] || {}), $lte: endDate };
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

// ---- New analytics export helpers (CSV only) ----

// Export freelancer work (month-aware, matches Freelancers tab)
const exportFreelancerWorkReport = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    let monthStart = null;
    let monthEnd = null;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      monthStart = new Date(year, mon - 1, 1);
      monthEnd = new Date(year, mon, 1);
    }

    const freelancers = await Freelancer.find({ status: 'approved' });

    const result = buildFreelancerWorkReport(freelancers, monthStart, monthEnd)
      .map(row => ({
        ...row,
        roles: (row.roles || []).join('; ')
      }))
      .filter(row => row.totalHours > 0 || row.totalEarnings > 0 || row.totalAssignments > 0);

    // Define fields explicitly so json2csv works even when result is empty
    // (exclude completedHours and completedEarnings as requested)
    const fields = [
      'freelancerId',
      'name',
      'email',
      'hourlyRate',
      'dailyRate',
      'availability',
      'totalAssignments',
      'completedAssignments',
      'inProgressAssignments',
      'totalHours',
      'totalEarnings',
      'roles'
    ];
    const format = (req.query.format || 'csv').toLowerCase();

    if (format === 'pdf') {
      const headingBase = 'Freelancer Work & Earnings';
      let heading = headingBase;
      if (month && /^\d{4}-\d{2}$/.test(month)) {
        const [year, mon] = month.split('-').map(Number);
        const label = new Date(year, mon - 1, 1).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long'
        });
        heading = `${headingBase} - ${label}`;
      }
      const suffix = req.query.month ? `_${req.query.month}` : '';
      const filename = `freelancer-work${suffix}.pdf`;
      return sendTableAsPdf(res, heading, result || [], filename);
    }

    const parser = new Parser({ fields });
    const csvBody = parser.parse(result || []);

    // Human-readable month heading
    let heading = 'Freelancer Work & Earnings';
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      const label = new Date(year, mon - 1, 1).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long'
      });
      heading = `${heading} - ${label}`;
    }
    const csv = `${heading}\n${csvBody}`;
    res.header('Content-Type', 'text/csv');
    const suffix = req.query.month ? `_${req.query.month}` : '';
    res.attachment(`freelancer-work${suffix}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting freelancer work report:', error);
    res.status(500).send('Server error');
  }
};

// Export recruitment pipeline – detailed report for all enquiries
const exportRecruitmentPipelineReport = async (req, res) => {
  try {
    // Pull all enquiries in the recruitment pipeline with key linked info
    const enquiries = await Enquiry.find()
      .populate('assigned_to', 'name email')
      .populate('assignedAssessor', 'fullName email')
      .populate('assignedMentor', 'name email')
      .populate('mentorAllocation.mentorId', 'name email');

    const rows = (enquiries || []).map(enquiry => {
      const assignedUser = enquiry.assigned_to || {};
      const assessor = enquiry.assignedAssessor || {};
      const mentor = enquiry.assignedMentor || enquiry.mentorAllocation?.mentorId || {};

      const submissionDateStr = enquiry.submission_date
        ? new Date(enquiry.submission_date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';

      const initialAssessmentDateStr = enquiry.initialAssessment?.assessmentDate
        ? new Date(enquiry.initialAssessment.assessmentDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';

      const fullAssessmentDateStr = enquiry.fullAssessment?.assessmentDate
        ? new Date(enquiry.fullAssessment.assessmentDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';

      const mentorStartDateStr = enquiry.mentorAllocation?.startDate
        ? new Date(enquiry.mentorAllocation.startDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';

      return {
        enquiryId: enquiry._id,
        fullName: enquiry.full_name,
        email: enquiry.email_address,
        telephone: enquiry.telephone || '',
        location: enquiry.location || '',
        postCode: enquiry.post_code || '',
        submissionDate: submissionDateStr,
        pipelineStage: enquiry.pipelineStage || '',
        status: enquiry.status || '',
        typeOfEnquiry: enquiry.type_of_enquiry || '',
        source: enquiry.source || '',
        assignedToName: assignedUser.name || '',
        assignedToEmail: assignedUser.email || '',
        assessorName: assessor.fullName || assessor.name || '',
        assessorEmail: assessor.email || '',
        mentorName: mentor.name || '',
        mentorEmail: mentor.email || '',
        initialAssessmentResult: enquiry.initialAssessment?.result || '',
        initialAssessmentDate: initialAssessmentDateStr,
        fullAssessmentResult: enquiry.fullAssessment?.result || '',
        fullAssessmentDate: fullAssessmentDateStr,
        mentorAllocationStatus: enquiry.mentorAllocation?.status || '',
        mentorAllocationStartDate: mentorStartDateStr,
        statusReason: enquiry.statusReason || ''
      };
    });

    const fields = [
      'enquiryId',
      'fullName',
      'email',
      'telephone',
      'location',
      'postCode',
      'submissionDate',
      'pipelineStage',
      'status',
      'typeOfEnquiry',
      'source',
      'assignedToName',
      'assignedToEmail',
      'assessorName',
      'assessorEmail',
      'mentorName',
      'mentorEmail',
      'initialAssessmentResult',
      'initialAssessmentDate',
      'fullAssessmentResult',
      'fullAssessmentDate',
      'mentorAllocationStatus',
      'mentorAllocationStartDate',
      'statusReason'
    ];
    const format = (req.query.format || 'csv').toLowerCase();

    if (format === 'pdf') {
      const heading = 'Recruitment Pipeline – detailed enquiries report';
      return sendTableAsPdf(res, heading, rows || [], 'recruitment-pipeline.pdf');
    }

    const parser = new Parser({ fields });
    const csvBody = parser.parse(rows || []);

    const heading = 'Recruitment Pipeline – detailed enquiries report';
    const csv = `${heading}\n${csvBody}`;
    res.header('Content-Type', 'text/csv');
    res.attachment('recruitment-pipeline.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting recruitment pipeline report:', error);
    res.status(500).send('Server error');
  }
};

// Export invoice & revenue analytics (matches Financial tab, last 12 months)
const exportInvoiceRevenueReport = async (req, res) => {
  try {
    // Reuse same default 12-month window as invoiceRevenueReport
    const { start, end } = req.query;
    const { startDate, endDate } = getDefaultDateRange(start, end);

    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.issuedDate = {};
      if (startDate) dateMatch.issuedDate.$gte = startDate;
      if (endDate) dateMatch.issuedDate.$lte = endDate;
    }

    const rows = [];
    // Detailed invoice rows only (one per invoice in the same window)
    const invoices = await Invoice.find(dateMatch).sort({ issuedDate: -1 });
    invoices.forEach(inv => {
      const issuedDateStr = inv.issuedDate
        ? new Date(inv.issuedDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';
      const dueDateStr = inv.dueDate
        ? new Date(inv.dueDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';

      rows.push({
        section: 'invoice',
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.client?.name || '',
        status: inv.status,
        issuedDate: issuedDateStr,
        dueDate: dueDateStr,
        total: inv.total,
        currency: inv.currency || 'GBP'
      });
    });

    // Explicit fields (invoice detail only) so json2csv works even when rows is empty
    const fields = [
      'section',
      'invoiceNumber',
      'clientName',
      'status',
      'issuedDate',
      'dueDate',
      'total',
      'currency'
    ];
    const format = (req.query.format || 'csv').toLowerCase();

    // Heading to reflect last 12 months window up to current month
    const now = new Date();
    const currentMonthLabel = now.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long'
    });
    const heading = `Financial overview - Last 12 months from ${currentMonthLabel}`;

    if (format === 'pdf') {
      return sendTableAsPdf(res, heading, rows || [], 'invoice-revenue.pdf');
    }

    const parser = new Parser({ fields });
    const csvBody = parser.parse(rows || []);

    const csv = `${heading}\n${csvBody}`;
    res.header('Content-Type', 'text/csv');
    res.attachment('invoice-revenue.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting invoice revenue report:', error);
    res.status(500).send('Server error');
  }
};

// Export training events analytics
const exportTrainingEventsAnalytics = async (req, res) => {
  try {
    const result = await trainingEventsReport({ query: req.query }, { json: d => d }) || {};
    const stats = result.stats || {};
    const upcomingEvents = result.upcomingEvents || [];

    const rows = [];
    // Stats
    Object.entries(stats).forEach(([key, value]) => {
      rows.push({ section: 'stats', metric: key, value });
    });
    // Upcoming events
    upcomingEvents.forEach(ev => {
      const startDateStr = ev.startDate
        ? new Date(ev.startDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';
      const endDateStr = ev.endDate
        ? new Date(ev.endDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';

      rows.push({
        section: 'upcoming',
        eventId: ev.eventId,
        title: ev.title,
        status: 'upcoming',
        startDate: startDateStr,
        endDate: endDateStr,
        location: ev.location,
        trainer: ev.trainer,
        maxParticipants: ev.maxParticipants,
        price: ev.price
      });
    });

    // All events (including draft/completed/cancelled) for full visibility
    const allEvents = await TrainingEvent.find().populate('trainer', 'name');
    allEvents.forEach(event => {
      const startDateStr = event.startDate
        ? new Date(event.startDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';
      const endDateStr = event.endDate
        ? new Date(event.endDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })
        : '';

      rows.push({
        section: 'event',
        eventId: event._id,
        title: event.title,
        status: event.status,
        startDate: startDateStr,
        endDate: endDateStr,
        location: event.location,
        trainer: event.trainer?.name || 'Not assigned',
        maxParticipants: event.maxParticipants,
        price: event.price
      });
    });

    // Explicit fields so json2csv works even when rows is empty
    const fields = [
      'section',
      'metric',
      'value',
      'eventId',
      'title',
      'status',
      'startDate',
      'endDate',
      'location',
      'trainer',
      'maxParticipants',
      'price'
    ];
    const format = (req.query.format || 'csv').toLowerCase();

    if (format === 'pdf') {
      const heading = 'Training Events Analytics';
      return sendTableAsPdf(res, heading, rows || [], 'training-events-analytics.pdf');
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(rows || []);
    res.header('Content-Type', 'text/csv');
    res.attachment('training-events-analytics.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting training events analytics:', error);
    res.status(500).send('Server error');
  }
};

// Export mentor analytics
const exportMentorReport = async (req, res) => {
  try {
    const mentors = await Mentor.find();

    // Build the same per-mentor report structure as mentorReport
    const report = await Promise.all(mentors.map(async (mentor) => {
      const assignments = await MentorActivity.find({
        mentorId: mentor._id,
        activityType: 'assignment'
      }).populate('enquiryId', 'full_name status');

      const assignmentIds = assignments.map(a => a._id);
      const logs = await MentorActivity.find({
        mentorId: mentor._id,
        parentAssignmentId: { $in: assignmentIds },
        activityType: 'assignment_log'
      });

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

    const sortedReport = report.sort((a, b) => b.totalAssignments - a.totalAssignments);

    const rows = [];
    // Mentor rows only
    sortedReport.forEach(m => {
      rows.push({
        section: 'mentor',
        mentorId: m.mentorId,
        name: m.name,
        email: m.email,
        phone: m.phone,
        status: m.status,
        specialization: m.specialization,
        totalAssignments: m.totalAssignments,
        activeAssignments: m.activeAssignments,
        completedAssignments: m.completedAssignments,
        totalActivityLogs: m.totalActivityLogs,
        assignedEnquiries: m.assignedEnquiries
      });
    });

    // Explicit fields so json2csv works even when rows is empty
    const fields = [
      'section',
      'mentorId',
      'name',
      'email',
      'phone',
      'status',
      'specialization',
      'totalAssignments',
      'activeAssignments',
      'completedAssignments',
      'totalActivityLogs',
      'assignedEnquiries'
    ];
    const format = (req.query.format || 'csv').toLowerCase();

    // Heading for mentor analytics
    const heading = 'Mentor Analytics (summary and mentor details)';

    if (format === 'pdf') {
      return sendTableAsPdf(res, heading, rows || [], 'mentor-analytics.pdf');
    }

    const parser = new Parser({ fields });
    const csvBody = parser.parse(rows || []);

    const csv = `${heading}\n${csvBody}`;
    res.header('Content-Type', 'text/csv');
    res.attachment('mentor-analytics.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting mentor report:', error);
    res.status(500).send('Server error');
  }
};

// Export combined Cases tab analytics (type distribution, caseload, opened/closed)
const exportCasesTabAnalytics = async (req, res) => {
  try {
    const casesStatus = await casesStatusReport({ query: req.query }, { json: d => d }) || {};
    const types = await caseTypeDistribution({ query: req.query }, { json: d => d }) || [];
    const caseload = await caseloadByWorker({ query: req.query }, { json: d => d }) || [];

    const rows = [];
    (types || []).forEach(t => {
      rows.push({ section: 'case-type-distribution', caseType: t.caseType, count: t.count });
    });
    (caseload || []).forEach(w => {
      rows.push({
        section: 'caseload-by-worker',
        userId: w.userId,
        name: w.name,
        email: w.email,
        isLead: w.isLead,
        count: w.count
      });
    });
    (casesStatus.opened || []).forEach(o => {
      rows.push({ section: 'cases-opened', date: o.date, count: o.count });
    });
    (casesStatus.closed || []).forEach(c => {
      rows.push({ section: 'cases-closed', date: c.date, count: c.count });
    });

    // Explicit fields so json2csv works even when rows is empty
    const fields = [
      'section',
      'caseType',
      'userId',
      'name',
      'email',
      'isLead',
      'date',
      'count'
    ];
    const format = (req.query.format || 'csv').toLowerCase();

    // Heading for cases analytics
    const heading = 'Cases Analytics (types, caseload, opened/closed)';

    if (format === 'pdf') {
      return sendTableAsPdf(res, heading, rows || [], 'cases-analytics.pdf');
    }

    const parser = new Parser({ fields });
    const csvBody = parser.parse(rows || []);

    const csv = `${heading}\n${csvBody}`;
    res.header('Content-Type', 'text/csv');
    res.attachment('cases-analytics.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting cases analytics:', error);
    res.status(500).send('Server error');
  }
};

// Helper to compute freelancer work stats (optionally month-filtered)
const buildFreelancerWorkReport = (freelancers, monthStart, monthEnd) => {
  return freelancers.map(freelancer => {
    const workHistory = freelancer.workHistory || [];

    // Filter assignments whose date range overlaps the month window
    const filteredHistory = monthStart && monthEnd
      ? workHistory.filter(w => {
          if (!w.startDate && !w.endDate) return false;
          const start = w.startDate ? new Date(w.startDate) : null;
          const end = w.endDate ? new Date(w.endDate) : null;
          // overlap: (start < monthEnd) && (end == null || end >= monthStart)
          if (start && start >= monthEnd) return false;
          if (end && end < monthStart) return false;
          return true;
        })
      : workHistory;

    const completedWork = filteredHistory.filter(w => w.status === 'completed');
    const inProgressWork = filteredHistory.filter(w => w.status === 'in_progress');

    const totalHours = filteredHistory.reduce((sum, w) => sum + (w.hours || 0), 0);
    const totalEarnings = filteredHistory.reduce((sum, w) => sum + (w.totalAmount || 0), 0);
    const completedHours = completedWork.reduce((sum, w) => sum + (w.hours || 0), 0);
    const completedEarnings = completedWork.reduce((sum, w) => sum + (w.totalAmount || 0), 0);

    return {
      freelancerId: freelancer._id,
      name: freelancer.fullName,
      email: freelancer.email,
      hourlyRate: freelancer.hourlyRate || 0,
      dailyRate: freelancer.dailyRate || 0,
      availability: freelancer.availability,
      totalAssignments: filteredHistory.length,
      completedAssignments: completedWork.length,
      inProgressAssignments: inProgressWork.length,
      totalHours,
      completedHours,
      totalEarnings,
      completedEarnings,
      roles: freelancer.roles || []
    };
  });
};

// Freelancer work hours and earnings report
const freelancerWorkReport = async (req, res) => {
  try {
    const { month } = req.query; // Expected format: YYYY-MM
    let monthStart = null;
    let monthEnd = null;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      monthStart = new Date(year, mon - 1, 1);
      monthEnd = new Date(year, mon, 1); // first day of next month (exclusive)
    }

    const freelancers = await Freelancer.find({ status: 'approved' });
    const report = buildFreelancerWorkReport(freelancers, monthStart, monthEnd);

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
    
    const statusBreakdown = {};
    
    enquiries.forEach(enquiry => {
      // Count by pipeline stage (use unified pipelineStage field)
      if (enquiry.pipelineStage) {
        pipelineStats[enquiry.pipelineStage] = (pipelineStats[enquiry.pipelineStage] || 0) + 1;
      }
      
      // Count by status (use raw status string so "New Enquiry" shows explicitly)
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

// Invoice and revenue analytics (defaults to last year)
const invoiceRevenueReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { startDate, endDate } = getDefaultDateRange(start, end);

    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.issuedDate = {};
      if (startDate) dateMatch.issuedDate.$gte = startDate;
      if (endDate) dateMatch.issuedDate.$lte = endDate;
    }

    const invoices = await Invoice.find(dateMatch);
    
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

    // Sort by month descending and take last 12 months
    const monthlyData = Object.values(monthlyRevenue)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);

    res.json({
      revenueStats,
      monthlyRevenue: monthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Training events analytics (defaults to last year for completed stats)
const trainingEventsReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { startDate, endDate } = getDefaultDateRange(start, end);

    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.startDate = {};
      if (startDate) dateMatch.startDate.$gte = startDate;
      if (endDate) dateMatch.startDate.$lte = endDate;
    }

    const events = await TrainingEvent.find(dateMatch).populate('trainer', 'name');
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
  mentorReport,
  // New CSV export helpers for analytics tabs
  exportFreelancerWorkReport,
  exportRecruitmentPipelineReport,
  exportInvoiceRevenueReport,
  exportTrainingEventsAnalytics,
  exportMentorReport,
  exportCasesTabAnalytics
}; 