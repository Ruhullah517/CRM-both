import api from './api';

// Get mentor applications
export const getMentorApplications = async () => {
  try {
    const response = await api.get('/recruitment/mentor-applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor applications:', error);
    throw error;
  }
};

// Get freelancer applications
export const getFreelancerApplications = async () => {
  try {
    const response = await api.get('/recruitment/freelancer-applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching freelancer applications:', error);
    throw error;
  }
};

// Update mentor application status
export const updateMentorStatus = async (id, status) => {
  try {
    const response = await api.put(`/recruitment/mentor-applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating mentor status:', error);
    throw error;
  }
};

// Update freelancer application status
export const updateFreelancerStatus = async (id, status) => {
  try {
    const response = await api.put(`/recruitment/freelancer-applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating freelancer status:', error);
    throw error;
  }
};

// Get recruitment statistics
export const getRecruitmentStats = async () => {
  try {
    const response = await api.get('/recruitment/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching recruitment statistics:', error);
    throw error;
  }
};

// Create meeting
export const createMeeting = async (meetingData) => {
  try {
    const response = await api.post('/recruitment/meetings', meetingData);
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Get meetings
export const getMeetings = async () => {
  try {
    const response = await api.get('/recruitment/meetings');
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

// Get stage entries for an enquiry
export const getStageEntries = async (enquiryId) => {
  try {
    const response = await api.get(`/recruitment/enquiries/${enquiryId}/stage-entries`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stage entries:', error);
    throw error;
  }
};

// Update enquiry stage
export const updateEnquiryStage = async (enquiryId, stage) => {
  try {
    const response = await api.put(`/recruitment/enquiries/${enquiryId}/stage`, { stage });
    return response.data;
  } catch (error) {
    console.error('Error updating enquiry stage:', error);
    throw error;
  }
};

// Add stage entry
export const addStageEntry = async (enquiryId, entryData) => {
  try {
    const response = await api.post(`/recruitment/enquiries/${enquiryId}/stage-entries`, entryData);
    return response.data;
  } catch (error) {
    console.error('Error adding stage entry:', error);
    throw error;
  }
};

// Upload stage entry file
export const uploadStageEntryFile = async (enquiryId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/recruitment/enquiries/${enquiryId}/stage-entries/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading stage entry file:', error);
    throw error;
  }
};

// Assign mentor/assessor
export const assignMentorAssessor = async (enquiryId, assignmentData) => {
  try {
    const response = await api.put(`/recruitment/enquiries/${enquiryId}/assign`, assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error assigning mentor/assessor:', error);
    throw error;
  }
};

// Update enquiry status
export const updateEnquiryStatus = async (enquiryId, status) => {
  try {
    const response = await api.put(`/recruitment/enquiries/${enquiryId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    throw error;
  }
};

// Set stage deadline
export const setStageDeadline = async (enquiryId, stage, deadline) => {
  try {
    const response = await api.post(`/recruitment/enquiries/${enquiryId}/stage-deadlines`, {
      stage,
      deadline
    });
    return response.data;
  } catch (error) {
    console.error('Error setting stage deadline:', error);
    throw error;
  }
};

// Complete stage deadline
export const completeStageDeadline = async (enquiryId, stage) => {
  try {
    const response = await api.put(`/recruitment/enquiries/${enquiryId}/stage-deadlines/${stage}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing stage deadline:', error);
    throw error;
  }
};

// Create initial assessment
export const createInitialAssessment = async (enquiryId, assessmentData) => {
  try {
    const response = await api.post(`/recruitment/enquiries/${enquiryId}/initial-assessment`, assessmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating initial assessment:', error);
    throw error;
  }
};

// Create full assessment
export const createFullAssessment = async (enquiryId, assessmentData) => {
  try {
    const response = await api.post(`/recruitment/enquiries/${enquiryId}/full-assessment`, assessmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating full assessment:', error);
    throw error;
  }
};

// Allocate mentoring
export const allocateMentoring = async (enquiryId, mentoringData) => {
  try {
    const response = await api.post(`/recruitment/enquiries/${enquiryId}/mentoring`, mentoringData);
    return response.data;
  } catch (error) {
    console.error('Error allocating mentoring:', error);
    throw error;
  }
};

// Add case note
export const addCaseNote = async (enquiryId, noteData) => {
  try {
    const response = await api.post(`/recruitment/enquiries/${enquiryId}/case-notes`, noteData);
    return response.data;
  } catch (error) {
    console.error('Error adding case note:', error);
    throw error;
  }
};