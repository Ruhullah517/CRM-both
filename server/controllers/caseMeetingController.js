const CaseMeeting = require('../models/CaseMeeting');

exports.listCaseMeetings = async (req, res) => {
  try {
    const { caseId } = req.params;
    const meetings = await CaseMeeting.find({ caseId }).sort({ meetingDate: -1 });
    res.json(meetings);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to fetch meetings' });
  }
};

exports.createCaseMeeting = async (req, res) => {
  try {
    const { caseId } = req.params;
    const meeting = new CaseMeeting({
      caseId,
      meetingDate: req.body.meetingDate,
      meetingType: req.body.meetingType,
      notes: req.body.notes,
      attachments: req.body.attachments || [],
      createdBy: req.user?._id,
    });
    await meeting.save();
    res.status(201).json(meeting);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to create meeting' });
  }
};

exports.uploadMeetingFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const fileMeta = {
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id,
    };
    res.status(201).json(fileMeta);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to upload file' });
  }
};


