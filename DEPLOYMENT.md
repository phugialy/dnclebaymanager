# DNCL eBay Manager - Deployment Guide

## Static Site Deployment on Vercel

### Current Configuration ✅

Your project is configured for **static site deployment** with the following setup:

- **Build Command**: `npm run build`
- **Output Directory**: `client/build`
- **Framework**: React (Create React App)
- **API Routes**: Available at `/api/*`

### Vercel Configuration

The `vercel.json` file is properly configured:

```json
{
  "version": 2,
  "name": "dncl-ebay-manager",
  "buildCommand": "npm run build",
  "outputDirectory": "client/build",
  "functions": {
    "api/index.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/health",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for static site deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the configuration
   - Build will run: `npm run build`
   - Static files will be served from `client/build`

### Environment Variables

Set these in your Vercel project settings:

```
NODE_ENV=production
```

### API Integration

When you're ready to add backend functionality:

1. **API Routes**: Available at `/api/*`
2. **CORS**: Configured for same-domain requests
3. **Authentication**: Ready for Gmail OAuth integration

### Current Features

✅ **Static Site Ready**:
- React app with routing
- Authentication system (placeholder)
- Dashboard, Listings, Orders pages
- Responsive design with Tailwind CSS
- API utility functions ready

✅ **Build Process**:
- TypeScript compilation
- CSS optimization
- Asset optimization
- Production-ready output

### Troubleshooting

**If build fails**:
1. Check `client/package.json` dependencies
2. Ensure all imports are correct
3. Verify TypeScript configuration

**If deployment fails**:
1. Check Vercel build logs
2. Verify `outputDirectory` path
3. Ensure `buildCommand` runs successfully

### Local Testing

Test the build locally:
```bash
cd client
npm run build
npm install -g serve
serve -s build
```

### Next Steps

1. Deploy to Vercel
2. Test the live application
3. Add real API endpoints when ready
4. Integrate Gmail OAuth authentication
5. Connect to eBay API

### File Structure

```
DNCL-Ebay-Manager/
├── client/                 # React frontend
│   ├── build/             # Production build output
│   ├── src/               # Source code
│   └── package.json       # Frontend dependencies
├── api/                   # API routes (serverless)
│   └── index.ts          # API handler
├── vercel.json           # Vercel configuration
└── package.json          # Root dependencies
```

### API Routes Available

- `/api/auth/*` - Authentication endpoints
- `/api/ebay/*` - eBay API integration
- `/api/dashboard/*` - Dashboard data
- `/health` - Health check endpoint

The application is ready for deployment as a static site with API routes! 