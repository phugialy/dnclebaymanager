import { Router } from 'express';
import EbayOAuthService from '../services/ebayOAuthService';
import EbayListingService from '../services/ebayListingService';
import TokenStorageService from '../services/tokenStorageService';
import { logger } from '../utils/logger';
import { Database } from 'sqlite3';

const router = Router();

// Initialize eBay services
let oauthService: EbayOAuthService;
let listingService: EbayListingService;
let tokenStorage: TokenStorageService;

function initializeEbayServices(db: Database) {
  oauthService = new EbayOAuthService({
    appId: process.env.EBAY_APP_ID || '',
    clientSecret: process.env.EBAY_CLIENT_SECRET || '',
    ruName: process.env.EBAY_RUNAME || '',
    actualRedirectUri: process.env.EBAY_ACTUAL_REDIRECT_URI || 'http://localhost:3000/api/ebay/auth/callback',
    sandbox: process.env.EBAY_SANDBOX === 'true',
  });

  tokenStorage = new TokenStorageService(db);

  // Debug: Log environment variables
  logger.info('eBay Config:', {
    appId: process.env.EBAY_APP_ID ? 'SET' : 'NOT SET',
    clientSecret: process.env.EBAY_CLIENT_SECRET ? 'SET' : 'NOT SET',
    sandbox: process.env.EBAY_SANDBOX,
  });

  listingService = new EbayListingService(oauthService, tokenStorage);
}

// Get listing by ListID (requires user authentication)
router.get('/listing/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const { userId } = req.query;
    
    if (!listId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ListID is required' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required. Please connect your eBay account first.' 
      });
    }

    if (!listingService) {
      return res.status(500).json({ 
        success: false, 
        message: 'eBay services not initialized' 
      });
    }

    logger.info(`Fetching eBay listing: ${listId} for user: ${userId}`);
    
    const listing = await listingService.getListingByListId(listId, userId.toString());
    
    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    return res.json({
      success: true,
      data: listing
    });
    
  } catch (error: any) {
    logger.error('Error fetching eBay listing:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch listing' 
    });
  }
});

// Get all listings (placeholder)
router.get('/listings', (req, res) => {
  res.json({ message: 'Get listings - to be implemented' });
});

// Create new listing (placeholder)
router.post('/listings', (req, res) => {
  res.json({ message: 'Create listing - to be implemented' });
});

// Update listing (placeholder)
router.put('/listings/:id', (req, res) => {
  res.json({ message: 'Update listing - to be implemented', id: req.params.id });
});

// Delete listing (placeholder)
router.delete('/listings/:id', (req, res) => {
  res.json({ message: 'Delete listing - to be implemented', id: req.params.id });
});

// Get orders (placeholder)
router.get('/orders', (req, res) => {
  res.json({ message: 'Get orders - to be implemented' });
});

export const ebayRoutes = router;
export { initializeEbayServices }; 