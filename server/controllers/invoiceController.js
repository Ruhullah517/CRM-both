const Invoice = require('../models/Invoice');
const TrainingBooking = require('../models/TrainingBooking');
const Case = require('../models/Case');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

// Generate PDF invoice
const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('relatedTrainingEvent', 'title')
      .populate('relatedCase', 'caseReferenceNumber');
    
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add company header
    doc.fontSize(20).text('Your Company Name', { align: 'center' });
    doc.fontSize(12).text('123 Business Street, City, Postcode', { align: 'center' });
    doc.fontSize(12).text('Phone: 01234 567890 | Email: info@company.com', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(16).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Invoice number and dates
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Issue Date: ${new Date(invoice.issuedDate).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.moveDown();

    // Client information
    doc.fontSize(14).text('Bill To:', { underline: true });
    doc.fontSize(12);
    doc.text(invoice.client.name);
    if (invoice.client.organization) doc.text(invoice.client.organization);
    if (invoice.client.address) doc.text(invoice.client.address);
    if (invoice.client.email) doc.text(invoice.client.email);
    if (invoice.client.phone) doc.text(invoice.client.phone);
    doc.moveDown();

    // Items table
    doc.fontSize(14).text('Items:', { underline: true });
    doc.moveDown();

    // Table header
    doc.fontSize(10);
    doc.text('Description', 50, doc.y);
    doc.text('Qty', 300, doc.y);
    doc.text('Unit Price', 350, doc.y);
    doc.text('Total', 450, doc.y);
    doc.moveDown();

    // Table rows
    invoice.items.forEach(item => {
      doc.text(item.description, 50, doc.y);
      doc.text(item.quantity.toString(), 300, doc.y);
      doc.text(`£${item.unitPrice.toFixed(2)}`, 350, doc.y);
      doc.text(`£${item.total.toFixed(2)}`, 450, doc.y);
      doc.moveDown();
    });

    // Totals
    doc.moveDown();
    doc.text(`Subtotal: £${invoice.subtotal.toFixed(2)}`, { align: 'right' });
    if (invoice.taxAmount > 0) {
      doc.text(`VAT (${invoice.taxRate}%): £${invoice.taxAmount.toFixed(2)}`, { align: 'right' });
    }
    doc.fontSize(14).text(`Total: £${invoice.total.toFixed(2)}`, { align: 'right' });
    doc.moveDown();

    // Notes
    if (invoice.notes) {
      doc.fontSize(12).text('Notes:', { underline: true });
      doc.fontSize(10).text(invoice.notes);
      doc.moveDown();
    }

    // Terms
    if (invoice.terms) {
      doc.fontSize(12).text('Terms:', { underline: true });
      doc.fontSize(10).text(invoice.terms);
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

    const stats = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalInvoices = await Invoice.countDocuments(match);
    const totalAmount = await Invoice.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      stats,
      totalInvoices,
      totalAmount: totalAmount[0]?.total || 0
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

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  deleteInvoice,
  generateInvoicePDF,
  getInvoiceStats,
  createInvoiceFromCase
};
