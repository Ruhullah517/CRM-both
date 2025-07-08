const Enquiry = require('../models/Enquiry');

// List all enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate('assigned_to', 'name');
    res.json(enquiries);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single enquiry by ID
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('assigned_to', 'name');
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    // For compatibility with old code, add assigned_to_name
    const obj = enquiry.toObject();
    obj.assigned_to_name = obj.assigned_to?.name || '';
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Approve an enquiry
const approveEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.json({ msg: 'Enquiry approved' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Reject an enquiry
const rejectEnquiry = async (req, res) => {
  const { reason } = req.body;
  try {
    await Enquiry.findByIdAndUpdate(req.params.id, { status: 'Rejected', rejection_reason: reason });
    res.json({ msg: 'Enquiry rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Assign an enquiry to a staff member
const assignEnquiry = async (req, res) => {
  const { staffId } = req.body;
  try {
    await Enquiry.findByIdAndUpdate(req.params.id, { assigned_to: staffId });
    res.json({ msg: 'Enquiry assigned' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new enquiry
const createEnquiry = async (req, res) => {
  try {
    console.log(req.body);
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json({ id: enquiry._id, msg: 'Enquiry created successfully' });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  approveEnquiry,
  rejectEnquiry,
  assignEnquiry,
}; 