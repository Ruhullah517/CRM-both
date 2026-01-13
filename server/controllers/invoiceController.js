const Invoice = require('../models/Invoice');
const InvoiceSettings = require('../models/InvoiceSettings');
const TrainingBooking = require('../models/TrainingBooking');
const TrainingEvent = require('../models/TrainingEvent');
const Case = require('../models/Case');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { processAutomationTrigger } = require('./emailAutomationController');

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('createdBy', 'name')
      .populate('relatedTrainingEvent', 'title')
      .populate('relatedCase', 'caseReferenceNumber')
      .sort({ created_at: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get single invoice
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('relatedTrainingEvent', 'title')
      .populate('relatedCase', 'caseReferenceNumber');
    
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const {
      client,
      items,
      subtotal,
      taxRate = 0,
      total,
      dueDate,
      notes,
      terms,
      relatedTrainingEvent,
      relatedCase
    } = req.body;

    const invoice = new Invoice({
      client,
      items,
      subtotal,
      taxRate,
      taxAmount: (subtotal * taxRate) / 100,
      total,
      dueDate,
      notes,
      terms,
      relatedTrainingEvent,
      relatedCase,
      createdBy: req.user.id
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Mark invoice as paid
const markInvoiceAsPaid = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    invoice.status = 'paid';
    invoice.paidDate = new Date();
    invoice.paymentMethod = paymentMethod;
    invoice.updated_at = new Date();

    await invoice.save();

    // Update related training booking payment status
    if (invoice.relatedTrainingEvent) {
      await TrainingBooking.updateMany(
        { 
          trainingEvent: invoice.relatedTrainingEvent,
          'payment.invoiceId': invoice._id
        },
        { 
          'payment.status': 'paid',
          'payment.paidAt': new Date()
        }
      );
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Amend paid invoice (change status back to pending)
const amendPaidInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    if (invoice.status !== 'paid') {
      return res.status(400).json({ msg: 'Only paid invoices can be amended' });
    }

    // Change status back to pending and clear payment details
    invoice.status = 'pending';
    invoice.paidDate = null;
    invoice.paymentMethod = null;
    invoice.updated_at = new Date();

    await invoice.save();

    // Update related training booking payment status back to pending
    if (invoice.relatedTrainingEvent) {
      await TrainingBooking.updateMany(
        { 
          trainingEvent: invoice.relatedTrainingEvent,
          'payment.invoiceId': invoice._id
        },
        { 
          'payment.status': 'pending',
          'payment.paidAt': null
        }
      );
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    // Allow deletion of draft and paid invoices
    if (invoice.status !== 'draft' && invoice.status !== 'paid') {
      return res.status(400).json({ msg: 'Only draft and paid invoices can be deleted' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Invoice deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Generate PDF invoice file and return file path
const generateInvoicePDFFile = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = 'uploads/invoices';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `invoice-${invoice.invoiceNumber}.pdf`;
      const filepath = path.join(uploadDir, filename);

      // Create PDF document with better margins
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 40,
        autoFirstPage: true
      });
      
      // Pipe to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Helper function to draw a line
      const drawLine = (y) => {
        doc.moveTo(40, y).lineTo(550, y).stroke();
      };

      // Helper function to draw a box
      const drawBox = (x, y, width, height, fill = false) => {
        if (fill) {
          doc.rect(x, y, width, height).fill('#f8f9fa');
        } else {
          doc.rect(x, y, width, height).stroke();
        }
      };

      // ===== HEADER SECTION =====
      // Left: Company logo image
      let logoLoaded = false;
      try {
        const { getLogoPaths } = require('../utils/logoResolver');
        const logoPaths = getLogoPaths('bg');
        
        for (const logoPath of logoPaths) {
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 35, { width: 120, height: 45 });
            logoLoaded = true;
            break;
          }
        }
      } catch (error) {
        console.log('Logo not found:', error.message);
      }
      
      // Fallback text if logo not found
      if (!logoLoaded) {
        doc.circle(52, 52, 24).fillAndStroke('#000', '#000');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
        doc.text('BFCA', 36, 48);
        
        // Company name next to logo
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
        doc.text('BLACK FOSTER CARERS', 85, 42);
        doc.text('ALLIANCE', 85, 54);
      }

      // Right: Invoice title and number
      doc.fontSize(32).font('Helvetica-Bold').fillColor('#000');
      doc.text('Invoice', 400, 35, { align: 'right', width: 155 });
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#666');
      doc.text(`Invoice# ${invoice.invoiceNumber}`, 400, 75, { align: 'right', width: 155 });
      
      // Balance Due
      doc.fontSize(8).font('Helvetica').fillColor('#666');
      doc.text('Balance Due', 400, 95, { align: 'right', width: 155 });
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000');
      doc.text(`£${invoice.total.toFixed(2)}`, 400, 105, { align: 'right', width: 155 });

      // Company Details Section
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
      doc.text('Black Foster Carers CIC', 40, 140);
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text('6 St Michael Court', 40, 155);
      doc.text('Wolverhampton, WV1 1DJ', 40, 168);
      doc.text('United Kingdom', 40, 181);
      doc.text('rachel@blackfostercarersalliance.co.uk', 40, 194);
      doc.text('Www.blackfostercarersalliance.co.uk', 40, 207);

      // Invoice Details - Left side
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#666');
      doc.text('BFCA', 40, 245);

      // Invoice Details - Right side
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Invoice Date :', 360, 245);
      doc.font('Helvetica-Bold').fillColor('#333');
      doc.text(new Date(invoice.issuedDate || invoice.created_at).toLocaleDateString('en-GB'), 475, 245);
      
      doc.font('Helvetica').fillColor('#666');
      doc.text('Terms :', 360, 260);
      doc.font('Helvetica-Bold').fillColor('#333');
      doc.text('Net 15', 475, 260);
      
      doc.font('Helvetica').fillColor('#666');
      doc.text('Due Date :', 360, 275);
      doc.font('Helvetica-Bold').fillColor('#333');
      doc.text(new Date(invoice.dueDate).toLocaleDateString('en-GB'), 475, 275);

      // ===== ITEMS TABLE =====
      const tableY = 305;
      
      // Table header with dark background (#1a1a1a or similar dark grey)
      doc.rect(40, tableY, 515, 25).fillAndStroke('#1a1a1a', '#1a1a1a');
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff');
      doc.text('#', 50, tableY + 8);
      doc.text('Description', 90, tableY + 8);
      doc.text('Qty', 350, tableY + 8, { align: 'right', width: 50 });
      doc.text('Rate', 410, tableY + 8, { align: 'right', width: 50 });
      doc.text('Amount', 470, tableY + 8, { align: 'right', width: 75 });

      // Table rows
      let currentY = tableY + 25;
      invoice.items.forEach((item, index) => {
        const rowHeight = 25;
        
        // Draw bottom border only
        doc.moveTo(40, currentY + rowHeight).lineTo(555, currentY + rowHeight).strokeColor('#e5e5e5').stroke();
        
        doc.fontSize(10).font('Helvetica').fillColor('#333');
        doc.text((index + 1).toString(), 50, currentY + 8);
        doc.text(item.description, 90, currentY + 8, { width: 250 });
        doc.text(item.quantity.toFixed(2), 350, currentY + 8, { align: 'right', width: 50 });
        doc.text(item.unitPrice.toFixed(2), 410, currentY + 8, { align: 'right', width: 50 });
        doc.text(item.total.toFixed(2), 470, currentY + 8, { align: 'right', width: 75 });
        
        currentY += rowHeight;
      });

      // ===== TOTALS SECTION =====
      const totalsY = currentY + 30;
      const totalsBoxWidth = 200;
      const totalsBoxX = 355;
      
      // Sub Total with bottom border
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text('Sub Total', totalsBoxX, totalsY);
      doc.text(invoice.subtotal.toFixed(2), totalsBoxX + 120, totalsY, { align: 'right', width: 80 });
      
      // Draw line under sub total
      doc.moveTo(totalsBoxX, totalsY + 15).lineTo(totalsBoxX + totalsBoxWidth, totalsY + 15).strokeColor('#d4d4d4').stroke();
      
      // Total (Bold, larger)
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000');
      doc.text('Total', totalsBoxX, totalsY + 25);
      doc.text(`£${invoice.total.toFixed(2)}`, totalsBoxX + 120, totalsY + 25, { align: 'right', width: 80 });
      
      // Draw thick line under total
      doc.moveTo(totalsBoxX, totalsY + 45).lineTo(totalsBoxX + totalsBoxWidth, totalsY + 45).strokeColor('#1a1a1a').lineWidth(2).stroke();
      doc.lineWidth(1); // Reset line width
      
      // Balance Due (Bold, larger)
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000');
      doc.text('Balance Due', totalsBoxX, totalsY + 55);
      doc.text(`£${invoice.total.toFixed(2)}`, totalsBoxX + 120, totalsY + 55, { align: 'right', width: 80 });

      // ===== FOOTER SECTION =====
      const footerY = totalsY + 110;
      
      // Draw top border for footer
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#d4d4d4').stroke();
      
      // Thanks message
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text('Thanks for your business.', 40, footerY + 15);
      
      // Bank details
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text('Black Foster Carers Alliance Sort Code: 23-05-80 Account Number: 51854683', 40, footerY + 30);

      // Handle stream events
      stream.on('finish', () => {
        const pdfUrl = `/uploads/invoices/${filename}`;
        resolve(pdfUrl);
      });

      stream.on('error', (error) => {
        reject(error);
      });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate PDF invoice (for API routes)
const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('relatedTrainingEvent', 'title')
      .populate('relatedCase', 'caseReferenceNumber');
    
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    // Load invoice settings (company + bank details)
    let settings = await InvoiceSettings.findOne();
    if (!settings) {
      settings = new InvoiceSettings();
      await settings.save();
    }

    // Create PDF document with the same layout used for emailed invoices / stored PDFs
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      autoFirstPage: true
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // ===== HEADER SECTION =====
    // Company logo on the left
    let logoLoaded = false;
    try {
      const { getLogoPaths } = require('../utils/logoResolver');
      const logoPaths = getLogoPaths('bg');

      for (const logoPath of logoPaths) {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 40, 35, { width: 120, height: 45 });
          logoLoaded = true;
          break;
        }
      }
    } catch (error) {
      console.log('Logo not found:', error.message);
    }

    // Fallback text logo if image not found
    if (!logoLoaded) {
      doc.circle(52, 52, 24).fillAndStroke('#000', '#000');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
      doc.text('BFCA', 36, 48);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
      doc.text('BLACK FOSTER CARERS', 85, 42);
      doc.text('ALLIANCE', 85, 54);
    }

    // Right: big "Invoice" title, invoice number, and balance due
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#000');
    doc.text('Invoice', 400, 35, { align: 'right', width: 155 });

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#666');
    doc.text(`Invoice# ${invoice.invoiceNumber}`, 400, 75, {
      align: 'right',
      width: 155
    });

    doc.fontSize(8).font('Helvetica').fillColor('#666');
    doc.text('Balance Due', 400, 95, { align: 'right', width: 155 });
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000');
    doc.text(`£${invoice.total.toFixed(2)}`, 400, 105, {
      align: 'right',
      width: 155
    });

    // Company details (left column) from settings
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
    doc.text(settings.companyName || 'Black Foster Carers CIC', 40, 140);

    doc.fontSize(10).font('Helvetica').fillColor('#333');
    if (settings.addressLine1) doc.text(settings.addressLine1, 40, 155);
    if (settings.addressLine2) doc.text(settings.addressLine2, 40, 168);
    if (settings.addressLine3) doc.text(settings.addressLine3, 40, 181);
    if (settings.email) doc.text(settings.email, 40, 194);
    if (settings.website) doc.text(settings.website, 40, 207);

    // Invoice reference (left small text)
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#666');
    doc.text('BFCA', 40, 245);

    // Invoice meta (right column)
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Invoice Date :', 360, 245);
    doc.font('Helvetica-Bold').fillColor('#333');
    doc.text(
      new Date(invoice.issuedDate || invoice.created_at).toLocaleDateString(
        'en-GB'
      ),
      475,
      245
    );

    doc.font('Helvetica').fillColor('#666');
    doc.text('Terms :', 360, 260);
    doc.font('Helvetica-Bold').fillColor('#333');
    doc.text('Net 15', 475, 260);

    doc.font('Helvetica').fillColor('#666');
    doc.text('Due Date :', 360, 275);
    doc.font('Helvetica-Bold').fillColor('#333');
    doc.text(
      new Date(invoice.dueDate).toLocaleDateString('en-GB'),
      475,
      275
    );

    // ===== ITEMS TABLE =====
    const tableY = 305;

    // Dark header bar
    doc.rect(40, tableY, 515, 25).fillAndStroke('#1a1a1a', '#1a1a1a');

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff');
    doc.text('#', 50, tableY + 8);
    doc.text('Description', 90, tableY + 8);
    doc.text('Qty', 350, tableY + 8, { align: 'right', width: 50 });
    doc.text('Rate', 410, tableY + 8, { align: 'right', width: 50 });
    doc.text('Amount', 470, tableY + 8, { align: 'right', width: 75 });

    // Table rows
    let currentY = tableY + 25;
    invoice.items.forEach((item, index) => {
      const rowHeight = 25;

      // Light separator under each row
      doc
        .moveTo(40, currentY + rowHeight)
        .lineTo(555, currentY + rowHeight)
        .strokeColor('#e5e5e5')
        .stroke();

      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text((index + 1).toString(), 50, currentY + 8);
      doc.text(item.description, 90, currentY + 8, { width: 250 });
      doc.text(item.quantity.toFixed(2), 350, currentY + 8, {
        align: 'right',
        width: 50
      });
      doc.text(item.unitPrice.toFixed(2), 410, currentY + 8, {
        align: 'right',
        width: 50
      });
      doc.text(item.total.toFixed(2), 470, currentY + 8, {
        align: 'right',
        width: 75
      });

      currentY += rowHeight;
    });

    // ===== TOTALS SECTION =====
    const totalsY = currentY + 30;
    const totalsBoxWidth = 200;
    const totalsBoxX = 355;

    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text('Sub Total', totalsBoxX, totalsY);
    doc.text(invoice.subtotal.toFixed(2), totalsBoxX + 120, totalsY, {
      align: 'right',
      width: 80
    });

    // Line under subtotal
    doc
      .moveTo(totalsBoxX, totalsY + 15)
      .lineTo(totalsBoxX + totalsBoxWidth, totalsY + 15)
      .strokeColor('#d4d4d4')
      .stroke();

    // Total
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000');
    doc.text('Total', totalsBoxX, totalsY + 25);
    doc.text(`£${invoice.total.toFixed(2)}`, totalsBoxX + 120, totalsY + 25, {
      align: 'right',
      width: 80
    });

    // Thick separator
    doc
      .moveTo(totalsBoxX, totalsY + 45)
      .lineTo(totalsBoxX + totalsBoxWidth, totalsY + 45)
      .strokeColor('#1a1a1a')
      .lineWidth(2)
      .stroke();
    doc.lineWidth(1);

    // Balance due
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000');
    doc.text('Balance Due', totalsBoxX, totalsY + 55);
    doc.text(`£${invoice.total.toFixed(2)}`, totalsBoxX + 120, totalsY + 55, {
      align: 'right',
      width: 80
    });

    // ===== FOOTER SECTION =====
    const footerY = totalsY + 110;

    doc
      .moveTo(40, footerY)
      .lineTo(555, footerY)
      .strokeColor('#d4d4d4')
      .stroke();

    doc.fontSize(9).font('Helvetica').fillColor('#666');
    doc.text(settings.footerNote || 'Thanks for your business.', 40, footerY + 15);

    const sortCodeText = settings.bankSortCode
      ? `Sort Code: ${settings.bankSortCode}`
      : '';
    const accountNumberText = settings.bankAccountNumber
      ? `Account Number: ${settings.bankAccountNumber}`
      : '';
    const bankLineParts = [
      settings.bankAccountName || 'Black Foster Carers Alliance',
      sortCodeText,
      accountNumberText
    ].filter(Boolean);

    if (bankLineParts.length > 0) {
      doc.text(bankLineParts.join(' '), 40, footerY + 30);
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get invoice statistics
const getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = {};
    if (startDate || endDate) {
      match.created_at = {};
      if (startDate) match.created_at.$gte = new Date(startDate);
      if (endDate) match.created_at.$lte = new Date(endDate);
    }

    // First, update overdue invoices automatically
    const today = new Date();
    await Invoice.updateMany(
      { 
        status: { $in: ['sent', 'draft'] },
        dueDate: { $lt: today }
      },
      { status: 'overdue' }
    );

    // Get all invoices to calculate stats
    const invoices = await Invoice.find(match);
    
    // Calculate stats by status
    const totalPaid = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const totalPending = invoices
      .filter(invoice => invoice.status === 'sent' || invoice.status === 'draft')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const totalOverdue = invoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

    console.log('Invoice stats calculated:', {
      totalPaid: totalPaid.toFixed(2),
      totalPending: totalPending.toFixed(2),
      totalOverdue: totalOverdue.toFixed(2),
      totalInvoices,
      totalAmount: totalAmount.toFixed(2)
    });

    res.json({
      totalPaid: totalPaid.toFixed(2),
      totalPending: totalPending.toFixed(2),
      totalOverdue: totalOverdue.toFixed(2),
      totalInvoices,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create invoice from case (for case-based billing)
const createInvoiceFromCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { items, dueDate, notes } = req.body;

    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ msg: 'Case not found' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0; // Set your tax rate
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const invoice = new Invoice({
      client: {
        name: caseItem.clientFullName,
        email: caseItem.contactInfo?.email,
        phone: caseItem.contactInfo?.phone,
        organization: caseItem.organization
      },
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      issuedDate: new Date(), // Set the issue date explicitly
      notes,
      relatedCase: caseId,
      createdBy: req.user.id
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create invoice from training booking
const createInvoiceFromTrainingBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { dueDate, notes } = req.body;

    const booking = await TrainingBooking.findById(bookingId)
      .populate('trainingEvent', 'title price');
    
    if (!booking) {
      return res.status(404).json({ msg: 'Training booking not found' });
    }

    if (booking.payment.invoiceId) {
      return res.status(400).json({ msg: 'Invoice already exists for this booking' });
    }

    // Calculate totals
    const unitPrice = booking.trainingEvent.price || 0;
    const subtotal = unitPrice;
    const taxRate = 0; // Set your tax rate
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const invoice = new Invoice({
      client: {
        name: booking.participant.name,
        email: booking.participant.email,
        phone: booking.participant.phone,
        organization: booking.participant.organization
      },
      items: [{
        description: `Training: ${booking.trainingEvent.title}`,
        quantity: 1,
        unitPrice: unitPrice,
        total: unitPrice,
        type: 'training',
        relatedId: booking.trainingEvent._id,
        notes: `Booking ID: ${booking._id}`
      }],
      subtotal,
      taxRate,
      taxAmount,
      total,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      issuedDate: new Date(),
      notes,
      relatedTrainingEvent: booking.trainingEvent._id,
      createdBy: req.user.id
    });

    await invoice.save();

    // Update booking with invoice reference
    booking.payment.invoiceId = invoice._id;
    booking.payment.status = 'pending';
    await booking.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Auto-create invoices for paid training events
const autoCreateInvoicesForPaidTraining = async (req, res) => {
  try {
    const { trainingEventId } = req.params;
    
    const trainingEvent = await TrainingEvent.findById(trainingEventId);
    if (!trainingEvent) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    // Find all confirmed bookings without invoices
    const bookings = await TrainingBooking.find({
      trainingEvent: trainingEventId,
      status: { $in: ['confirmed', 'attended', 'completed'] },
      'payment.invoiceId': { $exists: false }
    });

    const createdInvoices = [];

    for (const booking of bookings) {
      const unitPrice = trainingEvent.price || 0;
      const subtotal = unitPrice;
      const taxRate = 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const invoice = new Invoice({
        client: {
          name: booking.participant.name,
          email: booking.participant.email,
          phone: booking.participant.phone,
          organization: booking.participant.organization
        },
        items: [{
          description: `Training: ${trainingEvent.title}`,
          quantity: 1,
          unitPrice: unitPrice,
          total: unitPrice,
          type: 'training',
          relatedId: trainingEvent._id,
          notes: `Booking ID: ${booking._id}`
        }],
        subtotal,
        taxRate,
        taxAmount,
        total,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        issuedDate: new Date(),
        relatedTrainingEvent: trainingEvent._id,
        createdBy: req.user.id
      });

      await invoice.save();

      // Update booking with invoice reference
      booking.payment.invoiceId = invoice._id;
      booking.payment.status = 'pending';
      await booking.save();

      createdInvoices.push(invoice);
    }

    res.json({
      message: `Created ${createdInvoices.length} invoices`,
      invoices: createdInvoices
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get overdue invoices
const getOverdueInvoices = async (req, res) => {
  try {
    const today = new Date();
    
    // First update overdue status
    await Invoice.updateMany(
      { 
        status: { $in: ['sent', 'draft'] },
        dueDate: { $lt: today }
      },
      { status: 'overdue' }
    );

    const overdueInvoices = await Invoice.find({ status: 'overdue' })
      .populate('createdBy', 'name')
      .populate('relatedTrainingEvent', 'title')
      .populate('relatedCase', 'caseReferenceNumber')
      .sort({ dueDate: 1 });

    res.json(overdueInvoices);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Send invoice via email
const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    // Generate PDF
    const pdfUrl = await generateInvoicePDFFile(invoice);
    
    // Update invoice status and sent date
    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    // Trigger email automation for invoice sent
    processAutomationTrigger('invoice_sent', 'invoice', invoice._id, invoice.toObject());

    // TODO: Send email with PDF attachment
    // This would integrate with your email service
    
    res.json({ 
      message: 'Invoice sent successfully',
      pdfUrl: pdfUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  amendPaidInvoice,
  deleteInvoice,
  generateInvoicePDF,
  generateInvoicePDFFile,
  getInvoiceStats,
  createInvoiceFromCase,
  createInvoiceFromTrainingBooking,
  autoCreateInvoicesForPaidTraining,
  getOverdueInvoices,
  sendInvoice
};
