import { Router } from 'express';

const router = Router();

// Get all listings
router.get('/listings', (req, res) => {
  res.json({ message: 'Get listings - to be implemented' });
});

// Get single listing
router.get('/listings/:id', (req, res) => {
  res.json({ message: 'Get listing - to be implemented', id: req.params.id });
});

// Create new listing
router.post('/listings', (req, res) => {
  res.json({ message: 'Create listing - to be implemented' });
});

// Update listing
router.put('/listings/:id', (req, res) => {
  res.json({ message: 'Update listing - to be implemented', id: req.params.id });
});

// Delete listing
router.delete('/listings/:id', (req, res) => {
  res.json({ message: 'Delete listing - to be implemented', id: req.params.id });
});

// Get orders
router.get('/orders', (req, res) => {
  res.json({ message: 'Get orders - to be implemented' });
});

export const ebayRoutes = router; 