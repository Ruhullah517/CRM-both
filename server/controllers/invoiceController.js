const Invoice = require('../models/Invoice');
const TrainingBooking = require('../models/TrainingBooking');
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

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== 'draft') {
      return res.status(400).json({ msg: 'Only draft invoices can be deleted' });
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
      // Company Logo and Name (Left Side)
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#000');
      doc.text('BLACK FOSTER CARERS', 40, 40);
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#000');
      doc.text('ALLIANCE', 40, 65);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Black Foster Carers CIC', 40, 95);
      doc.text('6 St Michael Court, West Bromwich B70 BET, United Kingdom', 40, 110);
      doc.text('Email: hello@blackfostercarersalliance.co.uk', 40, 125);
      doc.text('Website: www.blackfostercarersalliance.co.uk', 40, 140);

      // Invoice title and details (right side)
      doc.fontSize(26).font('Helvetica-Bold').fillColor('#000');
      doc.text('INVOICE', 400, 40);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Invoice#', 400, 80);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
      doc.text(invoice.invoiceNumber, 450, 80, { width: 130 });
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Balance Due', 400, 100);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000');
      doc.text(`£${invoice.total.toFixed(2)}`, 450, 100);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Invoice Date:', 400, 125);
      doc.fontSize(10).font('Helvetica').fillColor('#000');
      doc.text(new Date(invoice.issuedDate || invoice.created_at).toLocaleDateString('en-GB'), 470, 125);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Terms:', 400, 140);
      doc.fontSize(10).font('Helvetica').fillColor('#000');
      doc.text('Net 15', 470, 140);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Due Date:', 400, 155);
      doc.fontSize(10).font('Helvetica').fillColor('#000');
      doc.text(new Date(invoice.dueDate).toLocaleDateString('en-GB'), 470, 155);

      // Draw header separator line
      drawLine(140);

      // ===== BILL TO SECTION =====
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000');
      doc.text('BFCA', 40, 180);
      
      // ===== INVOICE SUMMARY =====
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000');
      doc.text('Invoice Summary:', 400, 180);

      // ===== ITEMS TABLE =====
      // Table header with dark grey background
      const tableY = 220;
      doc.rect(40, tableY, 510, 25).fill('#666');
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff');
      doc.text('#', 50, tableY + 8);
      doc.text('Description', 80, tableY + 8);
      doc.text('Qty', 350, tableY + 8);
      doc.text('Rate', 400, tableY + 8);
      doc.text('Amount', 480, tableY + 8);

      // Table rows
      let currentY = tableY + 25;
      invoice.items.forEach((item, index) => {
        const rowHeight = 30;
        
        doc.fontSize(10).font('Helvetica').fillColor('#333');
        doc.text((index + 1).toString(), 50, currentY + 10);
        doc.text(item.description, 80, currentY + 10);
        doc.text(item.quantity.toString(), 350, currentY + 10);
        doc.text(`£${item.unitPrice.toFixed(2)}`, 400, currentY + 10);
        doc.text(`£${item.total.toFixed(2)}`, 480, currentY + 10);
        
        currentY += rowHeight;
      });

      // ===== TOTALS SECTION =====
      const totalsY = currentY + 20;
      const totalsBoxWidth = 200;
      const totalsBoxX = 350;
      
      // Summary box with light grey background
      doc.rect(totalsBoxX, totalsY, totalsBoxWidth, 80).fill('#f8f9fa');
      
      doc.fontSize(11).font('Helvetica').fillColor('#666');
      doc.text('Sub Total', totalsBoxX + 10, totalsY + 15);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
      doc.text(`£${invoice.subtotal.toFixed(2)}`, totalsBoxX + 120, totalsY + 15);
      
      if (invoice.taxAmount > 0) {
        doc.fontSize(11).font('Helvetica').fillColor('#666');
        doc.text(`VAT (${invoice.taxRate}%):`, totalsBoxX + 10, totalsY + 35);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
        doc.text(`£${invoice.taxAmount.toFixed(2)}`, totalsBoxX + 120, totalsY + 35);
      }
      
      // Total line
      doc.moveTo(totalsBoxX + 10, totalsY + 55).lineTo(totalsBoxX + totalsBoxWidth - 10, totalsY + 55).stroke();
      
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000');
      doc.text('Total', totalsBoxX + 10, totalsY + 65);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000');
      doc.text(`£${invoice.total.toFixed(2)}`, totalsBoxX + 120, totalsY + 65);
      
      // Balance Due box
      doc.rect(totalsBoxX, totalsY + 90, totalsBoxWidth, 30).fill('#e9ecef');
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');
      doc.text('Balance Due', totalsBoxX + 10, totalsY + 105);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000');
      doc.text(`£${invoice.total.toFixed(2)}`, totalsBoxX + 120, totalsY + 105);

      // ===== FOOTER SECTION =====
      const footerY = totalsY + 120;
      
      // Payment instructions
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#333');
      doc.text('Payment Instructions:', 40, footerY);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Please make payment within 30 days of the invoice date.', 40, footerY + 20);
      doc.text('Bank Transfer Details:', 40, footerY + 35);
      doc.text('Account Name: Black Foster Carers Alliance', 40, footerY + 50);
      doc.text('Account Number: 12345678', 40, footerY + 65);
      doc.text('Sort Code: 12-34-56', 40, footerY + 80);
      doc.text('Reference: ' + invoice.invoiceNumber, 40, footerY + 95);

      // Notes section (if exists)
      if (invoice.notes) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333');
        doc.text('Notes:', 320, footerY);
        
        doc.fontSize(10).font('Helvetica').fillColor('#666');
        // Split notes into multiple lines if needed
        const words = invoice.notes.split(' ');
        let line = '';
        let lineY = footerY + 20;
        
        words.forEach(word => {
          const testLine = line + word + ' ';
          if (testLine.length > 40) {
            doc.text(line, 320, lineY);
            line = word + ' ';
            lineY += 15;
          } else {
            line = testLine;
          }
        });
        if (line) {
          doc.text(line, 320, lineY);
        }
      }

      // ===== BOTTOM FOOTER =====
      const bottomY = 750;
      drawLine(bottomY);
      
      doc.fontSize(9).font('Helvetica').fillColor('#999');
      doc.text('Crafted with ease using', { align: 'center' });
      doc.text('Visit zoho.com/invoice to create truly professional invoices', { align: 'center' });

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

    // Create PDF document with better margins
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 40,
      autoFirstPage: true
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

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
    // Company logo/name area (left side)
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#2EAB2C');
    doc.text('BFCA', 40, 40);
    doc.fontSize(12).font('Helvetica').fillColor('#666');
    doc.text('Black Foster Carers Alliance', 40, 70);
    doc.fontSize(10);
    doc.text('Training & Development Services', 40, 85);
    doc.text('Email: info@bfca.org.uk', 40, 100);
    doc.text('Phone: +44 123 456 7890', 40, 115);

    // Invoice title and details (right side)
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#333');
    doc.text('INVOICE', 350, 40);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Invoice Number:', 350, 80);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
    doc.text(invoice.invoiceNumber, 430, 80);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Issue Date:', 350, 100);
    doc.fontSize(11).font('Helvetica').fillColor('#333');
          doc.text(new Date(invoice.issuedDate || invoice.created_at).toLocaleDateString('en-GB'), 430, 100);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Due Date:', 350, 115);
    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(new Date(invoice.dueDate).toLocaleDateString('en-GB'), 430, 115);

    // Draw header separator line
    drawLine(140);

    // ===== BILL TO SECTION =====
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333');
    doc.text('Bill To:', 40, 160);
    
    // Bill to box
    drawBox(40, 175, 250, 80, true);
    
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333');
    doc.text(invoice.client.name, 50, 185);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    if (invoice.client.organization) {
      doc.text(invoice.client.organization, 50, 200);
    }
    if (invoice.client.address) {
      doc.text(invoice.client.address, 50, 215);
    }
    if (invoice.client.email) {
      doc.text(invoice.client.email, 50, 230);
    }
    if (invoice.client.phone) {
      doc.text(invoice.client.phone, 50, 245);
    }

    // ===== INVOICE SUMMARY =====
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333');
    doc.text('Invoice Summary:', 320, 160);
    
    // Summary box
    drawBox(320, 175, 230, 80, true);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Total Amount:', 330, 185);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#2EAB2C');
    doc.text(`£${invoice.total.toFixed(2)}`, 430, 185);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Status:', 330, 205);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#dc3545');
    doc.text(invoice.status || 'Pending', 430, 205);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Payment Terms:', 330, 225);
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text('30 days from invoice date', 430, 225);

    // ===== ITEMS TABLE =====
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333');
    doc.text('Items & Services:', 40, 280);

    // Table header
    const tableY = 300;
    drawBox(40, tableY, 510, 25, true);
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
    doc.text('Description', 50, tableY + 8);
    doc.text('Qty', 350, tableY + 8);
    doc.text('Unit Price', 400, tableY + 8);
    doc.text('Total', 480, tableY + 8);

    // Table rows
    let currentY = tableY + 25;
    invoice.items.forEach((item, index) => {
      const rowHeight = 30;
      const isEven = index % 2 === 0;
      
      if (isEven) {
        drawBox(40, currentY, 510, rowHeight, true);
      } else {
        drawBox(40, currentY, 510, rowHeight, false);
      }
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(item.description, 50, currentY + 10);
      doc.text(item.quantity.toString(), 350, currentY + 10);
      doc.text(`£${item.unitPrice.toFixed(2)}`, 400, currentY + 10);
      doc.text(`£${item.total.toFixed(2)}`, 480, currentY + 10);
      
      currentY += rowHeight;
    });

    // ===== TOTALS SECTION =====
    const totalsY = currentY + 20;
    const totalsBoxWidth = 200;
    const totalsBoxX = 350;
    
    drawBox(totalsBoxX, totalsY, totalsBoxWidth, 80, true);
    
    doc.fontSize(11).font('Helvetica').fillColor('#666');
    doc.text('Subtotal:', totalsBoxX + 10, totalsY + 15);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
    doc.text(`£${invoice.subtotal.toFixed(2)}`, totalsBoxX + 120, totalsY + 15);
    
    if (invoice.taxAmount > 0) {
      doc.fontSize(11).font('Helvetica').fillColor('#666');
      doc.text(`VAT (${invoice.taxRate}%):`, totalsBoxX + 10, totalsY + 35);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
      doc.text(`£${invoice.taxAmount.toFixed(2)}`, totalsBoxX + 120, totalsY + 35);
    }
    
    // Total line
    drawLine(totalsY + 55);
    
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#2EAB2C');
    doc.text('Total Amount:', totalsBoxX + 10, totalsY + 65);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#2EAB2C');
    doc.text(`£${invoice.total.toFixed(2)}`, totalsBoxX + 120, totalsY + 65);

    // ===== FOOTER SECTION =====
    const footerY = totalsY + 120;
    
    // Payment instructions
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333');
    doc.text('Payment Instructions:', 40, footerY);
    
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Please make payment within 30 days of the invoice date.', 40, footerY + 20);
    doc.text('Bank Transfer Details:', 40, footerY + 35);
    doc.text('Account Name: Black Foster Carers Alliance', 40, footerY + 50);
    doc.text('Account Number: 12345678', 40, footerY + 65);
    doc.text('Sort Code: 12-34-56', 40, footerY + 80);
    doc.text('Reference: ' + invoice.invoiceNumber, 40, footerY + 95);

    // Notes section (if exists)
    if (invoice.notes) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#333');
      doc.text('Notes:', 320, footerY);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      // Split notes into multiple lines if needed
      const words = invoice.notes.split(' ');
      let line = '';
      let lineY = footerY + 20;
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        if (testLine.length > 40) {
          doc.text(line, 320, lineY);
          line = word + ' ';
          lineY += 15;
        } else {
          line = testLine;
        }
      });
      if (line) {
        doc.text(line, 320, lineY);
      }
    }

    // ===== BOTTOM FOOTER =====
    const bottomY = 750;
    drawLine(bottomY);
    
    doc.fontSize(9).font('Helvetica').fillColor('#999');
    doc.text('Thank you for your business!', { align: 'center' });
    doc.text('For any questions, please contact us at info@bfca.org.uk', { align: 'center' });

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
