import axios from 'axios';
import EbayAuthService from './ebayAuthService';
import { logger } from '../utils/logger';

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
  private authService: EbayAuthService;
  private baseURL: string;

  constructor(authService: EbayAuthService) {
    this.authService = authService;
    this.baseURL = authService.isSandbox 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';
  }

  async getListingByListId(listId: string): Promise<EbayListing | null> {
    try {
      const accessToken = await this.authService.getAccessToken();
      
      // Use eBay Browse API to get listing details
      const response = await axios.get(`${this.baseURL}/buy/browse/v1/item/${listId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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
      
      logger.error(`Failed to fetch eBay listing ${listId}:`, error);
      throw new Error(`Failed to fetch listing: ${error.response?.data?.message || error.message}`);
    }
  }
}

export default EbayListingService; 