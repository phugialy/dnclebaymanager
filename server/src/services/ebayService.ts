import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

// eBay API Types
export interface EbayListing {
  id: string;
  title: string;
  price: number;
  quantity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ENDED';
  views: number;
  watchers: number;
  created: string;
  updated: string;
  category: string;
  condition: string;
  description?: string;
  images?: string[];
}

export interface EbayOrder {
  id: string;
  buyer: {
    username: string;
    email: string;
  };
  items: Array<{
    listingId: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  date: string;
  shipping: {
    method: string;
    address: string;
    tracking?: string;
  };
}

export interface EbayApiConfig {
  appId: string;
  certId: string;
  clientSecret: string;
  sandbox: boolean;
  siteId: number;
}

class EbayService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private config: EbayApiConfig) {
    const baseURL = config.sandbox 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';

    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(async (config) => {
      if (this.shouldRefreshToken()) {
        await this.authenticate();
      }
      
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('eBay API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  private shouldRefreshToken(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return true;
    return new Date() > this.tokenExpiry;
  }

  private async authenticate(): Promise<void> {
    try {
      const authUrl = this.config.sandbox
        ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
        : 'https://api.ebay.com/identity/v1/oauth2/token';

      const response = await axios.post(authUrl, 
        'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.config.appId}:${this.config.clientSecret}`).toString('base64')}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      logger.info('eBay authentication successful');
    } catch (error) {
      logger.error('eBay authentication failed:', error);
      throw new Error('Failed to authenticate with eBay API');
    }
  }

  // Get all listings
  async getListings(): Promise<EbayListing[]> {
    try {
      const response = await this.api.get('/sell/inventory/v1/inventory_item');
      
      // Transform eBay response to our format
      const listings: EbayListing[] = response.data.inventoryItems?.map((item: any) => ({
        id: item.sku,
        title: item.product?.title || 'Untitled',
        price: item.product?.price || 0,
        quantity: item.availability?.total || 0,
        status: item.status || 'INACTIVE',
        views: 0, // eBay doesn't provide this in inventory API
        watchers: 0, // eBay doesn't provide this in inventory API
        created: item.createdDate || new Date().toISOString(),
        updated: item.lastModifiedDate || new Date().toISOString(),
        category: item.product?.category || 'Unknown',
        condition: item.product?.condition || 'Unknown',
        description: item.product?.description,
        images: item.product?.imageUrls || [],
      })) || [];

      return listings;
    } catch (error) {
      logger.error('Failed to fetch eBay listings:', error);
      throw new Error('Failed to fetch listings from eBay');
    }
  }

  // Get single listing
  async getListing(id: string): Promise<EbayListing | null> {
    try {
      const response = await this.api.get(`/sell/inventory/v1/inventory_item/${id}`);
      const item = response.data;
      
      return {
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
      };
    } catch (error) {
      logger.error(`Failed to fetch eBay listing ${id}:`, error);
      return null;
    }
  }

  // Create new listing
  async createListing(listingData: Partial<EbayListing>): Promise<EbayListing> {
    try {
      const payload = {
        product: {
          title: listingData.title,
          description: listingData.description,
          category: listingData.category,
          condition: listingData.condition,
          imageUrls: listingData.images,
        },
        availability: {
          total: listingData.quantity || 1,
        },
        packageWeightAndSize: {
          weight: {
            value: 1,
            unit: 'POUND',
          },
        },
      };

      const response = await this.api.post('/sell/inventory/v1/inventory_item', payload);
      
      return {
        id: response.data.sku,
        title: listingData.title || 'Untitled',
        price: listingData.price || 0,
        quantity: listingData.quantity || 1,
        status: 'ACTIVE',
        views: 0,
        watchers: 0,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        category: listingData.category || 'Unknown',
        condition: listingData.condition || 'Unknown',
        description: listingData.description,
        images: listingData.images || [],
      };
    } catch (error) {
      logger.error('Failed to create eBay listing:', error);
      throw new Error('Failed to create listing on eBay');
    }
  }

  // Update listing
  async updateListing(id: string, updates: Partial<EbayListing>): Promise<EbayListing | null> {
    try {
      const payload: any = {};
      
      if (updates.title || updates.description) {
        payload.product = {
          title: updates.title,
          description: updates.description,
        };
      }
      
      if (updates.quantity !== undefined) {
        payload.availability = {
          total: updates.quantity,
        };
      }

      await this.api.put(`/sell/inventory/v1/inventory_item/${id}`, payload);
      
      // Fetch updated listing
      return await this.getListing(id);
    } catch (error) {
      logger.error(`Failed to update eBay listing ${id}:`, error);
      throw new Error('Failed to update listing on eBay');
    }
  }

  // Delete listing
  async deleteListing(id: string): Promise<boolean> {
    try {
      await this.api.delete(`/sell/inventory/v1/inventory_item/${id}`);
      logger.info(`Successfully deleted eBay listing ${id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete eBay listing ${id}:`, error);
      return false;
    }
  }

  // Get orders
  async getOrders(): Promise<EbayOrder[]> {
    try {
      const response = await this.api.get('/sell/fulfillment/v1/order');
      
      const orders: EbayOrder[] = response.data.orders?.map((order: any) => ({
        id: order.orderId,
        buyer: {
          username: order.buyer?.username || 'Unknown',
          email: order.buyer?.email || 'Unknown',
        },
        items: order.lineItems?.map((item: any) => ({
          listingId: item.itemId,
          title: item.title || 'Unknown Item',
          quantity: item.quantity || 1,
          price: item.total?.value || 0,
        })) || [],
        total: order.pricingSummary?.total?.value || 0,
        status: this.mapOrderStatus(order.fulfillmentStartInstructions?.[0]?.fulfillmentStatus),
        date: order.creationDate || new Date().toISOString(),
        shipping: {
          method: order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo?.contactAddress?.city || 'Unknown',
          address: this.formatAddress(order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo?.contactAddress),
          tracking: order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo?.contactAddress?.city,
        },
      })) || [];

      return orders;
    } catch (error) {
      logger.error('Failed to fetch eBay orders:', error);
      throw new Error('Failed to fetch orders from eBay');
    }
  }

  private mapOrderStatus(fulfillmentStatus: string): EbayOrder['status'] {
    switch (fulfillmentStatus) {
      case 'FULFILLED':
        return 'SHIPPED';
      case 'IN_PROGRESS':
        return 'PAID';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'PAID';
    }
  }

  private formatAddress(address: any): string {
    if (!address) return 'Unknown';
    
    const parts = [
      address.contactAddress?.addressLine1,
      address.contactAddress?.city,
      address.contactAddress?.stateOrProvince,
      address.contactAddress?.postalCode,
    ].filter(Boolean);
    
    return parts.join(', ');
  }
}

export default EbayService; 