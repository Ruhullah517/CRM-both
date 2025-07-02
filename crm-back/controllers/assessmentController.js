const InitialAssessment = require('../models/InitialAssessment');

// Create a new assessment
const createAssessment = async (req, res) => {
  const { enquiry_id, staff_id, assessment_notes, assessment_date, attachments, status } = req.body;
  try {
    const assessment = new InitialAssessment({
      enquiry_id,
      staff_id,
      assessment_notes,
      assessment_date,
      attachments,
      status: status || 'Pending',
    });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get assessment by enquiry ID
const getAssessmentByEnquiryId = async (req, res) => {
  try {
    const assessment = await InitialAssessment.findOne({ enquiry_id: req.params.enquiryId });
    if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });
    res.json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createAssessment,
  getAssessmentByEnquiryId,
}; 