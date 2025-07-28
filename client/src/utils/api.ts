// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // Use relative path for production (same domain)
  : 'http://localhost:5000/api'; // Use localhost for development

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API utility functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Example API functions (for future use)
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
  
  getProfile: async () => {
    return apiRequest('/auth/profile');
  },
};

export const ebayAPI = {
  getListings: async () => {
    return apiRequest('/ebay/listings');
  },
  
  getOrders: async () => {
    return apiRequest('/ebay/orders');
  },
  
  getListingByListId: async (listId: string, userId: string) => {
    return apiRequest(`/ebay/listing/${listId}?userId=${userId}`);
  },
  
  createListing: async (listingData: any) => {
    return apiRequest('/ebay/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },
}; 