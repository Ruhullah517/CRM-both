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