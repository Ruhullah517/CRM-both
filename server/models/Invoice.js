const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  type: { type: String, enum: ['training', 'consultation', 'assessment', 'other'] },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Link to training event, case, etc.
  notes: String
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  client: {
    name: { type: String, required: true },
    email: String,
    phone: String,
    organization: String,
    address: String
  },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'GBP' },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], 
    default: 'draft' 
  },
  dueDate: { type: Date, required: true },
  issuedDate: { type: Date, default: Date.now },
  paidDate: Date,
  paymentMethod: String,
  notes: String,
  terms: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedTrainingEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingEvent' },
  relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Auto-generate invoice number
InvoiceSchema.pre('validate', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

InvoiceSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
