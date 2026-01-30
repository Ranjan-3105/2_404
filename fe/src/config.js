// Get the API base URL from environment or use defaults
const getApiBaseUrl = () => {
  // Check for explicit API URL environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  // In production, use relative path to same domain
  // or use a deployed backend URL
  return import.meta.env.VITE_API_URL || '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const OSINT_ENDPOINTS = {
  scan: `${API_BASE_URL}/osint/scan`,
  scanWithMedia: `${API_BASE_URL}/osint/scan-with-media`,
  health: `${API_BASE_URL}/health`
};
