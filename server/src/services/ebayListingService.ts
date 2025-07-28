import axios from 'axios';
import EbayOAuthService from './ebayOAuthService';
import TokenStorageService from './tokenStorageService';
import { logger } from '../utils/logger';
import { Database } from 'sqlite3';

export interface EbayListing {
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

class EbayListingService {
  private oauthService: EbayOAuthService;
  private tokenStorage: TokenStorageService;
  private baseURL: string;

  constructor(oauthService: EbayOAuthService, tokenStorage: TokenStorageService) {
    this.oauthService = oauthService;
    this.tokenStorage = tokenStorage;
    this.baseURL = oauthService.isSandbox 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';
  }

  async getListingByListId(listId: string, userId: string): Promise<EbayListing | null> {
    try {
      // Get user's stored tokens
      const storedTokens = await this.tokenStorage.getTokens(userId);
      
      if (!storedTokens) {
        throw new Error('User not authenticated. Please connect your eBay account first.');
      }

      // Check if token is expired and refresh if needed
      let accessToken = storedTokens.accessToken;
      if (this.tokenStorage.isTokenExpired(storedTokens.expiresAt)) {
        logger.info('Token expired, refreshing for listing lookup');
        const newTokens = await this.oauthService.refreshAccessToken(storedTokens.refreshToken);
        await this.tokenStorage.storeTokens(userId, newTokens);
        accessToken = newTokens.accessToken;
      }

      // Use eBay Browse API to get listing details with user's token
      // Using the correct endpoint for legacy item IDs
      const response = await axios.get(`${this.baseURL}/buy/browse/v1/item/get_item_by_legacy_id`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          legacy_item_id: listId
        }
      });

      const item = response.data;
      
      return {
        id: item.itemId,
        title: item.title,
        price: item.price?.value || 0,
        quantity: item.quantity || 1,
        status: item.itemWebUrl ? 'ACTIVE' : 'ENDED',
        views: 0, // Not available in Browse API
        watchers: 0, // Not available in Browse API
        created: item.itemCreationDate || new Date().toISOString(),
        updated: item.itemLastUpdateDate || new Date().toISOString(),
        category: item.categoryPath || 'Unknown',
        condition: item.condition || 'Unknown',
        description: item.description,
        images: item.image?.imageUrl ? [item.image.imageUrl] : [],
        seller: {
          username: item.seller?.username || 'Unknown',
          feedbackScore: item.seller?.feedbackScore || 0,
        },
        location: item.itemLocation?.city || 'Unknown',
        shipping: {
          cost: item.shippingOptions?.[0]?.shippingCost?.value || 0,
          method: item.shippingOptions?.[0]?.shippingServiceCode || 'Standard',
        },
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn(`Listing not found: ${listId}`);
        return null;
      }
      
      if (error.response?.status === 401) {
        logger.error(`Authentication failed for user ${userId}:`, error);
        throw new Error('Authentication failed. Please reconnect your eBay account.');
      }
      
      logger.error(`Failed to fetch eBay listing ${listId} for user ${userId}:`, error);
      throw new Error(`Failed to fetch listing: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get user's own listings (requires OAuth)
  async getUserListings(userId: string): Promise<EbayListing[]> {
    try {
      const storedTokens = await this.tokenStorage.getTokens(userId);
      
      if (!storedTokens) {
        throw new Error('User not authenticated. Please connect your eBay account first.');
      }

      let accessToken = storedTokens.accessToken;
      if (this.tokenStorage.isTokenExpired(storedTokens.expiresAt)) {
        const newTokens = await this.oauthService.refreshAccessToken(storedTokens.refreshToken);
        await this.tokenStorage.storeTokens(userId, newTokens);
        accessToken = newTokens.accessToken;
      }

      // Use eBay Inventory API to get user's own listings
      const response = await axios.get(`${this.baseURL}/sell/inventory/v1/inventory_item`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.inventoryItems?.map((item: any) => ({
        id: item.sku,
        title: item.product?.title || 'Untitled',
        price: item.product?.price || 0,
        quantity: item.availability?.total || 0,
        status: item.status || 'INACTIVE',
        views: 0,
        watchers: 0,
        created: item.createdDate || new Date().toISOString(),
        updated: item.lastModifiedDate || new Date().toISOString(),
        category: item.product?.category || 'Unknown',
        condition: item.product?.condition || 'Unknown',
        description: item.product?.description,
        images: item.product?.imageUrls || [],
        seller: {
          username: 'Your Account',
          feedbackScore: 0,
        },
        location: 'Your Location',
        shipping: {
          cost: 0,
          method: 'Standard',
        },
      })) || [];
    } catch (error: any) {
      logger.error(`Failed to fetch user listings for ${userId}:`, error);
      throw new Error(`Failed to fetch user listings: ${error.response?.data?.message || error.message}`);
    }
  }
}

export default EbayListingService; 