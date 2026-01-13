/**
 * API Configuration
 * 
 * This file imports from the centralized URL configuration.
 * To change URLs, edit: client/src/config/urls.js
 */

import { URL_CONFIG, getApiBaseUrl, getServerUrl } from './urls';

// Export API URLs from centralized config
export const API_BASE_URL = getApiBaseUrl();
export const SERVER_BASE_URL = getServerUrl();

// For backward compatibility and easy access
export default {
  API_BASE_URL,
  SERVER_BASE_URL,
  FRONTEND_URL: URL_CONFIG.FRONTEND_URL,
};
