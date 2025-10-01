import api from './api';

// Public API endpoints - No authentication required
const PUBLIC_API_URL = 'https://crm-backend-0v14.onrender.com/api/leads';

// For local development, use:
// const PUBLIC_API_URL = 'http://localhost:5000/api/leads';

// Submit contact form (public)
export const submitContactForm = async (data) => {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/contact-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// Subscribe to newsletter (public)
export const subscribeNewsletter = async (data) => {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};

// Submit training interest (public)
export const submitTrainingInterest = async (data) => {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/training-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting training interest:', error);
    throw error;
  }
};

// Submit mentoring interest (public)
export const submitMentoringInterest = async (data) => {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/mentoring-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting mentoring interest:', error);
    throw error;
  }
};

export default {
  submitContactForm,
  subscribeNewsletter,
  submitTrainingInterest,
  submitMentoringInterest
};

