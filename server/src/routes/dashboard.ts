import { Router } from 'express';

const router = Router();

// Get dashboard overview
router.get('/overview', (req, res) => {
  res.json({ message: 'Dashboard overview - to be implemented' });
});

// Get analytics data
router.get('/analytics', (req, res) => {
  res.json({ message: 'Analytics data - to be implemented' });
});

// Get recent activity
router.get('/activity', (req, res) => {
  res.json({ message: 'Recent activity - to be implemented' });
});

export const dashboardRoutes = router; 