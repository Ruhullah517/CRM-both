const mongoose = require('mongoose');

const InvoiceSettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Black Foster Carers CIC' },
  addressLine1: { type: String, default: '6 St Michael Court' },
  addressLine2: { type: String, default: 'Wolverhampton, WV1 1DJ' },
  addressLine3: { type: String, default: 'United Kingdom' },
  email: { type: String, default: 'rachel@blackfostercarersalliance.co.uk' },
  website: { type: String, default: 'Www.blackfostercarersalliance.co.uk' },
  bankAccountName: { type: String, default: 'Black Foster Carers Alliance' },
  bankAccountNumber: { type: String, default: '51854683' },
  bankSortCode: { type: String, default: '23-05-80' },
  footerNote: {
    type: String,
    default: 'Thanks for your business.'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

InvoiceSettingsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('InvoiceSettings', InvoiceSettingsSchema);


