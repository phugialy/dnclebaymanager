import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import Orders from './pages/Orders';
import ListingLookup from './pages/ListingLookup';
import Login from './pages/Login';
import EbayAuth from './pages/EbayAuth';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/ebay-auth" element={<EbayAuth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="listings" element={<Listings />} />
              <Route path="orders" element={<Orders />} />
              <Route path="listing-lookup" element={<ListingLookup />} />
            </Route>
            {/* Redirect any unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 