const Candidate = require('../models/Candidate');
const Enquiry = require('../models/Enquiry');

// List all candidates (including approved enquiries as foster carers)
const getAllCandidates = async (req, res) => {
  try {
    // Get regular candidates
    const candidates = await Candidate.find();
    
    // Get approved enquiries and convert them to candidate format
    const approvedEnquiries = await Enquiry.find({ status: 'Approved' })
      .populate('assigned_to', 'name')
      .populate('mentorAllocation.mentorId', 'name')
      .populate('caseClosure.closedBy', 'name');
    
    // Convert approved enquiries to candidate format
    const fosterCarersFromEnquiries = approvedEnquiries.map(enquiry => ({
      _id: enquiry._id,
      name: enquiry.full_name,
      email: enquiry.email_address,
      phone: enquiry.telephone,
      status: 'Active', // Approved enquiries become active foster carers
      stage: 'Approval', // They've completed the approval stage
      mentor: enquiry.mentorAllocation?.mentorId?.name || 'Not assigned',
      deadline: enquiry.caseClosure?.closureDate || enquiry.updatedAt,
      notes: enquiry.caseClosure?.outcomes ? [{ 
        text: enquiry.caseClosure.outcomes, 
        date: enquiry.caseClosure.closureDate 
      }] : [],
      documents: [], // Could be populated from assessment documents if needed
      // Additional fields from enquiry
      location: enquiry.location,
      postCode: enquiry.post_code,
      submissionDate: enquiry.submission_date,
      approvedDate: enquiry.caseClosure?.closureDate,
      approvedBy: enquiry.caseClosure?.closedBy?.name,
      assignedTo: enquiry.assigned_to?.name,
      // Flag to identify this came from an enquiry
      fromEnquiry: true,
      originalEnquiryId: enquiry._id
    }));
    
    // Combine regular candidates with foster carers from approved enquiries
    const allCandidates = [...candidates, ...fosterCarersFromEnquiries];
    
    res.json(allCandidates);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ msg: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new candidate
const createCandidate = async (req, res) => {
  const { name, email, mentor, status, stage, notes, documents, deadline } = req.body;
  try {
    const candidate = new Candidate({
      name,
      email,
      mentor,
      status,
      stage,
      notes: notes || [],
      documents: documents || [],
      deadline
    });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a candidate
const updateCandidate = async (req, res) => {
  const { name, email, mentor, status, stage, notes, documents, deadline } = req.body;
  try {
    await Candidate.findByIdAndUpdate(req.params.id, {
      name,
      email,
      mentor,
      status,
      stage,
      notes: notes || [],
      documents: documents || [],
      deadline
    });
    res.json({ msg: 'Candidate updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a candidate
const deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Candidate deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Assign mentor to candidate
const assignMentorToCandidate = async (req, res) => {
  const { mentor } = req.body;
  const Mentor = require('../models/Mentor');
  
  try {
    // Get the current candidate to check if they already have a mentor
    const currentCandidate = await Candidate.findById(req.params.id);
    const candidateId = req.params.id;
    
    // Remove candidate from previous mentor's mentees array
    if (currentCandidate.mentor && currentCandidate.mentor !== mentor) {
      const previousMentor = await Mentor.findOne({ name: currentCandidate.mentor });
      if (previousMentor) {
        await Mentor.findByIdAndUpdate(previousMentor._id, {
          $pull: { mentees: candidateId }
        });
      }
    }
    
    // Update candidate's mentor
    await Candidate.findByIdAndUpdate(req.params.id, { mentor });
    
    // Add candidate to new mentor's mentees array
    if (mentor) {
      const mentorDoc = await Mentor.findOne({ name: mentor });
      if (mentorDoc) {
        // Add candidate to mentor's mentees if not already there
        if (!mentorDoc.mentees.includes(candidateId)) {
          await Mentor.findByIdAndUpdate(mentorDoc._id, {
            $push: { mentees: candidateId }
          });
        }
      }
    }
    
    res.json({ msg: 'Mentor assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  assignMentorToCandidate,
}; 