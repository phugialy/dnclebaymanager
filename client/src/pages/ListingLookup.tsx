import React, { useState } from 'react';
import { MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ebayAPI } from '../utils/api';

interface EbayListing {
  id: string;
  title: string;
  price: number;
  quantity: number;
  status: string;
  views: number;
  watchers: number;
  created: string;
  updated: string;
  category: string;
  condition: string;
  description?: string;
  images?: string[];
  seller: {
    username: string;
    feedbackScore: number;
  };
  location: string;
  shipping: {
    cost: number;
    method: string;
  };
}

const ListingLookup: React.FC = () => {
  const [listId, setListId] = useState('');
  const [listing, setListing] = useState<EbayListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listId.trim()) {
      setError('Please enter a ListID');
      return;
    }

    setLoading(true);
    setError(null);
    setListing(null);

    try {
      const response = await ebayAPI.getListingByListId(listId.trim());
      
      if (response.success) {
        setListing(response.data);
      } else {
        setError(response.message || 'Failed to fetch listing');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the listing');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            eBay Listing Lookup
          </h1>
          <p className="text-gray-600">
            Search for eBay listings by their ListID to get detailed information
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="listId" className="block text-sm font-medium text-gray-700 mb-2">
                eBay ListID
              </label>
              <input
                type="text"
                id="listId"
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                placeholder="Enter eBay ListID (e.g., 123456789)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !listId.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {listing && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Listing Details</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  listing.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Main Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{listing.title}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(listing.price)}
                      </span>
                      {listing.shipping.cost > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          + {formatPrice(listing.shipping.cost)} shipping
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <span className="ml-2 font-medium">{listing.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Condition:</span>
                        <span className="ml-2 font-medium">{listing.condition}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 font-medium">{listing.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <span className="ml-2 font-medium">{listing.location}</span>
                      </div>
                    </div>

                    {listing.description && (
                      <div>
                        <span className="text-gray-500 text-sm">Description:</span>
                        <p className="mt-1 text-sm text-gray-700 line-clamp-3">
                          {listing.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Seller & Details */}
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Seller Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Username:</span>
                        <span className="ml-2 font-medium">{listing.seller.username}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Feedback Score:</span>
                        <span className="ml-2 font-medium">{listing.seller.feedbackScore.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-gray-500">Shipping Method:</span>
                      <span className="ml-2 font-medium">{listing.shipping.method}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 font-medium">{formatDate(listing.created)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2 font-medium">{formatDate(listing.updated)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ListID:</span>
                      <span className="ml-2 font-medium font-mono">{listing.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {listing.images && listing.images.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {listing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Listing image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingLookup; 