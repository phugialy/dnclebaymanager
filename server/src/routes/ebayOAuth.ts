import { Router } from 'express';
import EbayOAuthService from '../services/ebayOAuthService';
import TokenStorageService from '../services/tokenStorageService';
import { logger } from '../utils/logger';
import { Database } from 'sqlite3';

const router = Router();

// Initialize services
let oauthService: EbayOAuthService;
let tokenStorage: TokenStorageService;

function initializeEbayOAuth(db: Database) {
  oauthService = new EbayOAuthService({
    appId: process.env.EBAY_APP_ID || '',
    clientSecret: process.env.EBAY_CLIENT_SECRET || '',
    ruName: process.env.EBAY_RUNAME || '',
    actualRedirectUri: process.env.EBAY_ACTUAL_REDIRECT_URI || 'http://localhost:3000/api/ebay/auth/callback',
    sandbox: process.env.EBAY_SANDBOX === 'true',
  });

  tokenStorage = new TokenStorageService(db);

  logger.info('eBay OAuth services initialized');
}

/**
 * Step 1: Initiate OAuth flow
 * GET /api/ebay/auth/login
 * Redirects user to eBay for authorization
 */
router.get('/login', (req, res) => {
  try {
    if (!oauthService) {
          res.status(500).json({
      success: false,
      message: 'OAuth service not initialized'
    });
    return;
    }

    // Generate a state parameter for security
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in session or database for validation
    // For now, we'll use a simple approach
    const authUrl = oauthService.buildAuthUrl(state);
    
    logger.info('Redirecting to eBay OAuth:', { state });
    
    res.json({
      success: true,
      authUrl,
      state
    });
    return;
  } catch (error: any) {
    logger.error('Failed to initiate OAuth flow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate OAuth flow'
    });
    return;
  }
});

/**
 * Step 2: Handle OAuth callback
 * GET /api/ebay/auth/callback
 * Handles the callback from eBay with authorization code
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      logger.error('OAuth error from eBay:', error);
      res.status(400).json({
        success: false,
        message: `OAuth error: ${error}`
      });
      return;
    }

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
      return;
    }

    logger.info('Received OAuth callback:', { code: code.toString().substring(0, 10) + '...' });

    // Exchange code for tokens
    const tokens = await oauthService.exchangeCodeForTokens(code.toString());
    
    // Get user information
    const user = await oauthService.getUserInfo(tokens.accessToken);
    
    // Store tokens and user info
    await tokenStorage.storeTokens(user.userId, tokens);
    await tokenStorage.storeUser(user);

    logger.info('OAuth flow completed successfully for user:', user.username);

    // Redirect to frontend with success
    // Use the actual redirect URI that eBay configured in the portal
    const clientUrl = process.env.CLIENT_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const redirectUrl = `${clientUrl}/ebay-auth?userId=${user.userId}`;
    
    res.redirect(redirectUrl);
    return;
  } catch (error: any) {
    logger.error('OAuth callback failed:', error);
    
    const clientUrl = process.env.CLIENT_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const errorUrl = `${clientUrl}/ebay-auth?message=${encodeURIComponent(error.message)}`;
    res.redirect(errorUrl);
    return;
  }
});

/**
 * Get current user's tokens
 * GET /api/ebay/auth/tokens
 */
router.get('/tokens', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    const storedTokens = await tokenStorage.getTokens(userId.toString());
    
    if (!storedTokens) {
      res.status(404).json({
        success: false,
        message: 'No tokens found for user'
      });
      return;
    }

    // Check if token is expired
    if (tokenStorage.isTokenExpired(storedTokens.expiresAt)) {
      logger.info('Token expired, attempting refresh');
      
      try {
        const newTokens = await oauthService.refreshAccessToken(storedTokens.refreshToken);
        await tokenStorage.storeTokens(userId.toString(), newTokens);
        
        res.json({
          success: true,
          data: {
            accessToken: newTokens.accessToken,
            expiresAt: newTokens.expiresAt,
            isExpired: false
          }
        });
        return;
      } catch (refreshError: any) {
        logger.error('Token refresh failed:', refreshError);
        res.status(401).json({
          success: false,
          message: 'Token expired and refresh failed. Please re-authenticate.',
          requiresReauth: true
        });
        return;
      }
    } else {
      res.json({
        success: true,
        data: {
          accessToken: storedTokens.accessToken,
          expiresAt: storedTokens.expiresAt,
          isExpired: false
        }
      });
      return;
    }
  } catch (error: any) {
    logger.error('Failed to get tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tokens'
    });
    return;
  }
});

/**
 * Get user information
 * GET /api/ebay/auth/user
 */
router.get('/user', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    const user = await tokenStorage.getUser(userId.toString());
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
    return;
  } catch (error: any) {
    logger.error('Failed to get user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information'
    });
    return;
  }
});

/**
 * Logout (revoke tokens)
 * POST /api/ebay/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    // Get current tokens for revocation
    const storedTokens = await tokenStorage.getTokens(userId);
    
    if (storedTokens) {
      // Revoke tokens on eBay
      await oauthService.revokeToken(storedTokens.accessToken, 'access_token');
      await oauthService.revokeToken(storedTokens.refreshToken, 'refresh_token');
      
      // Delete tokens from storage
      await tokenStorage.deleteTokens(userId);
    }

    logger.info('User logged out successfully:', userId);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    return;
  } catch (error: any) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
    return;
  }
});

/**
 * Health check for OAuth service
 * GET /api/ebay/auth/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'eBay OAuth service is healthy',
    config: {
      appId: process.env.EBAY_APP_ID ? 'SET' : 'NOT SET',
      ruName: process.env.EBAY_RUNAME || 'NOT SET',
      actualRedirectUri: process.env.EBAY_ACTUAL_REDIRECT_URI || 'NOT SET',
      sandbox: process.env.EBAY_SANDBOX === 'true'
    }
  });
  return;
});

export const ebayOAuthRoutes = router;
export { initializeEbayOAuth }; 