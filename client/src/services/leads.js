import api from './api';

// Public API endpoints - No authentication required
import { SERVER_BASE_URL } from '../config/api';

const PUBLIC_API_URL = `${SERVER_BASE_URL}/api/leads`;

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

