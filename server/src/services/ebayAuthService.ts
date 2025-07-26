import axios from 'axios';
import { logger } from '../utils/logger';

export interface EbayAuthConfig {
  appId: string;
  devId: string;
  clientSecret: string;
  sandbox: boolean;
}

class EbayAuthService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  public config: EbayAuthConfig;

  get isSandbox(): boolean {
    return this.config.sandbox;
  }

  constructor(config: EbayAuthConfig) {
    this.config = config;
  }

  private shouldRefreshToken(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return true;
    return new Date() > this.tokenExpiry;
  }

  async getAccessToken(): Promise<string> {
    if (this.shouldRefreshToken()) {
      await this.authenticate();
    }
    return this.accessToken!;
  }

  private async authenticate(): Promise<void> {
    try {
      const authUrl = this.config.sandbox
        ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
        : 'https://api.ebay.com/identity/v1/oauth2/token';

      // Debug: Log what we're sending
      logger.info('eBay Auth Debug:', {
        authUrl,
        appId: this.config.appId ? 'SET' : 'NOT SET',
        clientSecret: this.config.clientSecret ? 'SET' : 'NOT SET',
        authHeader: `Basic ${Buffer.from(`${this.config.appId}:${this.config.clientSecret}`).toString('base64')}`,
      });

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
}

export default EbayAuthService; 