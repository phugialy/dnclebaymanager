import { Router } from 'express';
import EbayAuthService from '../services/ebayAuthService';
import EbayListingService from '../services/ebayListingService';
import { logger } from '../utils/logger';

const router = Router();

// Initialize eBay services
const authService = new EbayAuthService({
  appId: process.env.EBAY_APP_ID || '',
  certId: process.env.EBAY_CERT_ID || '',
  clientSecret: process.env.EBAY_CLIENT_SECRET || '',
  sandbox: process.env.EBAY_SANDBOX === 'true',
});

const listingService = new EbayListingService(authService);

// Get listing by ListID
router.get('/listing/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    
    if (!listId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ListID is required' 
      });
    }

    logger.info(`Fetching eBay listing: ${listId}`);
    
    const listing = await listingService.getListingByListId(listId);
    
    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({
      success: true,
      data: listing
    });
    
  } catch (error: any) {
    logger.error('Error fetching eBay listing:', error);
    res.status(500).json({ 
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