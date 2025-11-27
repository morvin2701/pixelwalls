// Utility functions for API calls

// Helper function to get backend URL
export const getBackendUrl = () => {
  // Determine if we're in development or production
  const isDevelopment = () => {
    // Check if we're running on localhost
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('localhost:') ||
           window.location.port.startsWith('300') ||  // This will match 3000, 3001, 3002, etc.
           window.location.port === '5173' ||
           window.location.port === '3000';  // Add port 3000 as development port
  };
  
  // For production, use your Render backend URL
  // For development, use localhost:5000
  return isDevelopment() 
    ? 'http://localhost:5000' 
    : 'https://pixelwallsbackend.onrender.com';  // Use your Render backend URL
};