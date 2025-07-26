import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://dncl-ebay-manager.vercel.app', 'https://dncl-ebay-manager-git-main.vercel.app'] // Update with your actual Vercel domain
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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

// Basic API routes (placeholder for now)
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

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Placeholder authentication
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

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    activeListings: 24,
    totalOrders: 156,
    revenue: 12450,
    conversionRate: 3.2
  });
});

app.get('/api/ebay/listings', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'iPhone 13 Pro - 128GB - Excellent Condition',
      price: 799.99,
      quantity: 1,
      status: 'Active',
      views: 45,
      watchers: 3,
      created: '2024-01-15'
    },
    {
      id: 2,
      title: 'Samsung Galaxy S21 - 256GB - Like New',
      price: 649.99,
      quantity: 2,
      status: 'Active',
      views: 32,
      watchers: 1,
      created: '2024-01-14'
    }
  ]);
});

app.get('/api/ebay/orders', (req, res) => {
  res.json([
    {
      id: '12345',
      buyer: 'john_doe123',
      items: ['iPhone 13 Pro - 128GB'],
      total: 799.99,
      status: 'Paid',
      date: '2024-01-15',
      shipping: 'Priority Mail'
    },
    {
      id: '12346',
      buyer: 'sarah_smith',
      items: ['Samsung Galaxy S21 - 256GB'],
      total: 649.99,
      status: 'Shipped',
      date: '2024-01-14',
      shipping: 'Express Mail'
    }
  ]);
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
} 