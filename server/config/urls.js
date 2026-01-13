/**
 * Centralized URL Configuration for Server
 * 
 * This file contains all URL configurations for the backend.
 * Change URLs here and they will apply throughout the entire server application.
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';

// URL Configuration
const URL_CONFIG = {
  // Frontend URLs

  // FRONTEND_URL: 'https://crm.blackfostercarersalliance.co.uk',
  FRONTEND_URL: 'http://localhost:5173/',

  // Backend/Server URLs
  // SERVER_URL: 'https://crm-backend-0v14.onrender.com',
  SERVER_URL: 'https://backendcrm.blackfostercarersalliance.co.uk',

  // API Base URL (for internal references)
  API_BASE_URL: 'https://backendcrm.blackfostercarersalliance.co.uk/api',
  // API_BASE_URL: 'https://crm-backend-0v14.onrender.com/api',
};

// Helper function to get frontend URL
const getFrontendUrl = () => URL_CONFIG.FRONTEND_URL;

// Helper function to get server URL
const getServerUrl = () => URL_CONFIG.SERVER_URL;

// Helper function to get API base URL
const getApiBaseUrl = () => URL_CONFIG.API_BASE_URL;

// Log configuration on load (for debugging)
console.log('📍 URL Configuration Loaded:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Frontend URL:', URL_CONFIG.FRONTEND_URL);
console.log('   Server URL:', URL_CONFIG.SERVER_URL);
console.log('   API Base URL:', URL_CONFIG.API_BASE_URL);

module.exports = {
  URL_CONFIG,
  getFrontendUrl,
  getServerUrl,
  getApiBaseUrl,
};

