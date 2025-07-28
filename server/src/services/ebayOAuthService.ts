import axios from 'axios';
import { logger } from '../utils/logger';

export interface EbayOAuthConfig {
  appId: string;
  clientSecret: string;
  ruName: string; // eBay RuName (e.g., Phu_Ly-PhuLy-DNCLList--zpmog)
  actualRedirectUri: string; // The actual redirect URI that eBay will redirect to
  sandbox: boolean;
}

export interface EbayTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  expiresAt: Date;
}

export interface EbayUser {
  userId: string;
  username: string;
  email?: string;
  accountType: string;
}

class EbayOAuthService {
  private config: EbayOAuthConfig;
  private baseURL: string;
  private authURL: string;

  constructor(config: EbayOAuthConfig) {
    this.config = config;
    this.baseURL = config.sandbox 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';
    this.authURL = config.sandbox
      ? 'https://auth.sandbox.ebay.com'
      : 'https://auth.ebay.com';
  }

  get isSandbox(): boolean {
    return this.config.sandbox;
  }

  /**
   * Step 1: Build the Authorization URL
   * Redirects user to eBay for OAuth authorization
   * Uses RuName as redirect_uri parameter (eBay requirement)
   */
  buildAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.ruName, // Use RuName instead of full URL
      response_type: 'code',
      scope: 'https://api.ebay.com/oauth/api_scope',
      ...(state && { state })
    });

    return `${this.authURL}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Step 2 & 3: Exchange authorization code for tokens
   * Handles the callback and exchanges code for access/refresh tokens
   */
  async exchangeCodeForTokens(authCode: string): Promise<EbayTokens> {
    try {
      logger.info('Exchanging authorization code for tokens');

      const response = await axios.post(
        `${this.baseURL}/identity/v1/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: this.config.ruName // Use RuName for token exchange too
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.config.appId}:${this.config.clientSecret}`).toString('base64')}`
          }
        }
      );

      const tokens: EbayTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        expiresAt: new Date(Date.now() + (response.data.expires_in * 1000))
      };

      logger.info('Successfully exchanged code for tokens');
      return tokens;
    } catch (error: any) {
      logger.error('Failed to exchange code for tokens:', {
        status: error.response?.status,
        message: error.response?.data?.error_description || error.message
      });
      throw new Error(`OAuth token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Step 4: Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<EbayTokens> {
    try {
      logger.info('Refreshing access token');

      const response = await axios.post(
        `${this.baseURL}/identity/v1/oauth2/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          scope: 'https://api.ebay.com/oauth/api_scope'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.config.appId}:${this.config.clientSecret}`).toString('base64')}`
          }
        }
      );

      const tokens: EbayTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken, // eBay may not return new refresh token
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        expiresAt: new Date(Date.now() + (response.data.expires_in * 1000))
      };

      logger.info('Successfully refreshed access token');
      return tokens;
    } catch (error: any) {
      logger.error('Failed to refresh access token:', {
        status: error.response?.status,
        message: error.response?.data?.error_description || error.message
      });
      throw new Error(`Token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Step 5: Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<EbayUser> {
    try {
      logger.info('Fetching user information from eBay');

      const response = await axios.get(
        `${this.baseURL}/commerce/identity/v1/user/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const user: EbayUser = {
        userId: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        accountType: response.data.accountType
      };

      logger.info('Successfully fetched user information');
      return user;
    } catch (error: any) {
      logger.error('Failed to fetch user information:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw new Error(`Failed to fetch user info: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Validate if tokens are still valid
   */
  isTokenExpired(expiresAt: Date): boolean {
    // Refresh token 5 minutes before expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return new Date() > new Date(expiresAt.getTime() - bufferTime);
  }

  /**
   * Revoke access token (logout)
   */
  async revokeToken(token: string, tokenType: 'access_token' | 'refresh_token' = 'access_token'): Promise<boolean> {
    try {
      logger.info(`Revoking ${tokenType}`);

      await axios.post(
        `${this.baseURL}/identity/v1/oauth2/revoke`,
        new URLSearchParams({
          token: token,
          token_type_hint: tokenType
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.config.appId}:${this.config.clientSecret}`).toString('base64')}`
          }
        }
      );

      logger.info(`Successfully revoked ${tokenType}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to revoke ${tokenType}:`, {
        status: error.response?.status,
        message: error.response?.data?.error_description || error.message
      });
      return false;
    }
  }
}

export default EbayOAuthService; 