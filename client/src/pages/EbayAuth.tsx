import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../utils/api';

interface EbayUser {
  id: string;
  ebayUserId: string;
  username: string;
  email?: string;
  accountType: string;
  createdAt: string;
  updatedAt: string;
}

const EbayAuth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<EbayUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      // This would check if user has valid tokens
      // For now, we'll just check if there's a user in localStorage
      const storedUser = localStorage.getItem('ebayUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await apiRequest(`/ebay/auth/user?userId=${userId}`);
      
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('ebayUser', JSON.stringify(userData));
        localStorage.setItem('ebayUserId', userId);
        
        // Redirect to dashboard after successful auth
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Failed to fetch user info:', error);
      setError(error.message || 'Failed to fetch user information');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const userId = searchParams.get('userId');
    const errorMessage = searchParams.get('message');

    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
      return;
    }

    if (userId) {
      // Successfully authenticated, fetch user info
      fetchUserInfo(userId);
    } else {
      // Check if user is already authenticated
      checkAuthStatus();
    }
  }, [searchParams, fetchUserInfo]);

  const initiateOAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/ebay/auth/login');
      
      if (response.success) {
        // Redirect to eBay OAuth
        window.location.href = response.authUrl;
      } else {
        setError('Failed to initiate OAuth flow');
      }
    } catch (error: any) {
      console.error('OAuth initiation failed:', error);
      setError(error.message || 'Failed to start OAuth flow');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('ebayUserId');
      
      if (userId) {
        await apiRequest('/ebay/auth/logout', { 
          method: 'POST',
          body: JSON.stringify({ userId })
        });
      }
      
      // Clear local storage
      localStorage.removeItem('ebayUser');
      localStorage.removeItem('ebayUserId');
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to home
      navigate('/');
    } catch (error: any) {
      console.error('Logout failed:', error);
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Processing...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Error</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setError(null);
                  navigate('/');
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Successfully Authenticated!</h3>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Account Type:</strong> {user.accountType}</p>
              {user.email && <p><strong>Email:</strong> {user.email}</p>}
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
              <button
                onClick={logout}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Connect to eBay</h3>
          <p className="mt-2 text-sm text-gray-500">
            Connect your eBay account to manage listings and orders.
          </p>
          <div className="mt-6">
            <button
              onClick={initiateOAuth}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : 'Connect eBay Account'}
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbayAuth; 