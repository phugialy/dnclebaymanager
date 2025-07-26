// Environment configuration
export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API URLs
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? '/api' // Relative path for same-domain API calls
    : 'http://localhost:5000/api', // Local development
    
  // App configuration
  appName: 'DNCL eBay Manager',
  appVersion: '1.0.0',
  
  // Feature flags
  features: {
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableDebugLogs: process.env.NODE_ENV === 'development',
  },
  
  // Authentication
  auth: {
    tokenKey: 'dncl_auth_token',
    refreshTokenKey: 'dncl_refresh_token',
  },
};

// Debug logging in development
if (environment.isDevelopment) {
  console.log('Environment:', environment);
} 