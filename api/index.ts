import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://dnclebaymanager.vercel.app', 'https://dnclebaymanager-git-main.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// eBay OAuth endpoints
app.get('/api/ebay/auth/login', async (req, res) => {
  try {
    const appId = process.env.EBAY_APP_ID;
    const ruName = process.env.EBAY_RUNAME;
    const scope = 'https://api.ebay.com/oauth/api_scope';
    const state = Math.random().toString(36).substring(7);

    const params = new URLSearchParams({
      client_id: appId || '',
      redirect_uri: ruName || '',
      response_type: 'code',
      scope: scope,
      state: state
    });

    const authUrl = `https://auth.ebay.com/oauth2/authorize?${params.toString()}`;

    res.json({
      success: true,
      authUrl: authUrl,
      state: state
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate OAuth URL'
    });
  }
});

app.get('/api/ebay/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/ebay-auth?message=${encodeURIComponent('Authorization code not received')}`);
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://api.ebay.com/identity/v1/oauth2/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: process.env.EBAY_RUNAME || ''
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.EBAY_APP_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64')}`
        }
      }
    );

    const tokens = tokenResponse.data;
    
    // Get user info
    const userResponse = await axios.get('https://api.ebay.com/buy/browse/v1/user', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const userData = {
      userId: userResponse.data.username,
      username: userResponse.data.username,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    };

    // Redirect to frontend with user data
    const clientUrl = process.env.CLIENT_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const redirectUrl = `${clientUrl}/ebay-auth?userId=${userData.userId}`;
    
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    const clientUrl = process.env.CLIENT_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const errorUrl = `${clientUrl}/ebay-auth?message=${encodeURIComponent(error.message || 'OAuth authentication failed')}`;
    res.redirect(errorUrl);
  }
});

app.get('/api/ebay/auth/user', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // In a real app, you'd fetch user data from database
    // For now, return mock data
    res.json({
      success: true,
      data: {
        id: userId,
        ebayUserId: userId,
        username: userId,
        accountType: 'business',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user data'
    });
  }
});

app.post('/api/ebay/auth/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // In a real app, you'd invalidate tokens in database
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to logout'
    });
  }
});

app.get('/api/ebay/auth/health', (req, res) => {
  res.json({
    success: true,
    message: 'eBay OAuth service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'dncl' && password === 'adminDNCL@25') {
    res.json({
      success: true,
      user: {
        id: '1',
        username: 'dncl',
        email: 'admin@dncl.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    user: {
      id: '1',
      username: 'dncl',
      email: 'admin@dncl.com',
      role: 'admin'
    }
  });
});

// Dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    activeListings: 24,
    totalOrders: 156,
    revenue: 12450,
    conversionRate: 3.2
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Vercel function handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
} 