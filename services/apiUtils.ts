// Utility functions for API calls

// Helper function to determine if we're in development
// Helper function to determine if we're in development
const isDevelopment = () => {
  // Check if we're running on localhost or local network
  const hostname = window.location.hostname;
  return hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('localhost:') ||
    hostname.startsWith('192.168.') || // Local network
    hostname.startsWith('10.') ||      // Local network
    window.location.port.startsWith('300') ||  // This will match 3000, 3001, 3002, etc.
    window.location.port === '5173' ||
    window.location.port === '3000';  // Add port 3000 as development port
};

// Helper function to get backend URL
export const getBackendUrl = () => {
  // For production, use your Render backend URL
  // For development, use hostname:5000 (supports mobile/local network)
  return isDevelopment()
    ? `http://${window.location.hostname}:5000`
    : 'https://pixelwallsbackend.onrender.com';  // Use your Render backend URL
};

// Function to check if we're in production (more reliable)
export const isProduction = () => {
  return !isDevelopment();
};

// Additional function to get backend URL with environment check
export const getBackendUrlWithEnvCheck = () => {
  // Check for environment variable first (if available)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || process.env.VITE_BACKEND_URL;

  if (backendUrl) {
    return backendUrl;
  }

  // Fallback to our detection logic
  return getBackendUrl();
};