import { Router } from 'express';

const router = Router();

// Login endpoint
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - to be implemented' });
});

// Get current user
router.get('/me', (req, res) => {
  res.json({ message: 'Get current user - to be implemented' });
});

export const authRoutes = router; 