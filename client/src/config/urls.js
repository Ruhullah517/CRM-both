/**
 * Centralized URL Configuration for Client
 * 
 * This file contains all URL configurations for the frontend.
 * Change URLs here and they will apply throughout the entire client application.
 */

// URL Configuration
export const URL_CONFIG = {
  // Hardcoded production URLs (single source of truth)
  // FRONTEND_URL: 'https://crm.blackfostercarersalliance.co.uk',
  FRONTEND_URL: 'http://localhost:5173/',
  // SERVER_URL: 'https://backendcrm.blackfostercarersalliance.co.uk',
  SERVER_URL: 'http://localhost:5000',
  // API_BASE_URL: 'https://backendcrm.blackfostercarersalliance.co.uk/api',
  API_BASE_URL: 'http://localhost:5000/api',
};

// Helper functions
export const getFrontendUrl = () => URL_CONFIG.FRONTEND_URL;
export const getServerUrl = () => URL_CONFIG.SERVER_URL;
export const getApiBaseUrl = () => URL_CONFIG.API_BASE_URL;

// Log configuration (for debugging)
console.log('📍 URL Configuration Loaded:');
console.log('   Environment:', 'production');
console.log('   Frontend URL:', URL_CONFIG.FRONTEND_URL);
console.log('   Server URL:', URL_CONFIG.SERVER_URL);
console.log('   API Base URL:', URL_CONFIG.API_BASE_URL);

// Default export
export default URL_CONFIG;

