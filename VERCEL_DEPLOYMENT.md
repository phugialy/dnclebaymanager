# Vercel Deployment Guide for eBay OAuth

## 🚀 **Deployment Steps**

### **1. Prepare Your Repository**

Make sure your code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment with eBay OAuth"
git push origin main
```

### **2. Deploy to Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`

### **3. Configure Environment Variables**

In your Vercel dashboard, go to **Settings > Environment Variables** and add:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# eBay API Configuration (PRODUCTION)
EBAY_APP_ID=Phuly-DNCLList-PRD-82b57c9de-6d50e473
EBAY_CLIENT_SECRET=your_actual_client_secret_here
EBAY_RUNAME=Phu_Ly-PhuLy-DNCLList--zpmog
EBAY_ACTUAL_REDIRECT_URI=https://your-app-name.vercel.app/api/ebay/auth/callback
EBAY_SANDBOX=false

# Client Configuration
CLIENT_URL=https://your-app-name.vercel.app

# Database Configuration
DB_PATH=./data/ebay_manager.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### **4. Update eBay Developer Portal**

**IMPORTANT**: You must update your eBay Developer Portal with the production URLs:

1. Go to [eBay Developer Portal](https://developer.ebay.com/)
2. Navigate to your application settings
3. In **"Your auth accepted URL"** field, add:
   ```
   https://your-app-name.vercel.app/api/ebay/auth/callback
   ```

### **5. OAuth URLs for Production**

#### **Accept URL (Success)**
```
https://your-app-name.vercel.app/ebay-auth?userId=USER_ID
```

#### **Decline URL (Error)**
```
https://your-app-name.vercel.app/ebay-auth?message=ERROR_MESSAGE
```

#### **Privacy Policy URL**
```
https://your-app-name.vercel.app/privacy
```

#### **Terms of Service URL**
```
https://your-app-name.vercel.app/terms
```

### **6. Test the Deployment**

1. **Health Check**: Visit `https://your-app-name.vercel.app/health`
2. **OAuth Health**: Visit `https://your-app-name.vercel.app/api/ebay/auth/health`
3. **Main App**: Visit `https://your-app-name.vercel.app/ebay-auth`

### **7. OAuth Flow in Production**

1. **User clicks "Connect eBay Account"**
2. **eBay redirects to**: `https://your-app-name.vercel.app/api/ebay/auth/callback`
3. **Server processes OAuth callback**
4. **Success**: Redirects to `https://your-app-name.vercel.app/ebay-auth?userId=123`
5. **Error**: Redirects to `https://your-app-name.vercel.app/ebay-auth?message=error`

## 🔧 **Configuration Files**

### **vercel.json** (Already Updated)
```json
{
  "version": 2,
  "name": "dncl-ebay-manager",
  "buildCommand": "cd client && npm install && npm run build",
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
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "redirects": [
    {
      "source": "/ebay-auth",
      "destination": "/",
      "permanent": false
    },
    {
      "source": "/auth/success",
      "destination": "/ebay-auth",
      "permanent": false
    },
    {
      "source": "/auth/error",
      "destination": "/ebay-auth",
      "permanent": false
    }
  ]
}
```

## 🛡️ **Security Considerations**

1. **Environment Variables**: Never commit sensitive data to your repository
2. **HTTPS**: Vercel automatically provides HTTPS
3. **CORS**: Configure CORS for your domain
4. **Rate Limiting**: Implement proper rate limiting
5. **Token Security**: Store tokens securely

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **OAuth Callback Fails**
   - Check that the redirect URL in eBay Developer Portal matches exactly
   - Verify environment variables are set correctly

2. **Build Fails**
   - Check that all dependencies are installed
   - Verify TypeScript compilation passes

3. **Database Issues**
   - Consider using Vercel's serverless database or external DB
   - SQLite may not work in serverless environment

### **Debug Commands:**

```bash
# Check build locally
npm run build

# Test TypeScript compilation
npx tsc --noEmit

# Test OAuth URL generation
node server/debug-oauth.js
```

## 📋 **Checklist Before Deployment**

- [ ] Code is committed and pushed to GitHub
- [ ] Environment variables are configured in Vercel
- [ ] eBay Developer Portal is updated with production URLs
- [ ] TypeScript compilation passes
- [ ] Build process works locally
- [ ] OAuth URLs are correctly configured
- [ ] Privacy Policy and Terms of Service pages exist

## 🎯 **Post-Deployment**

1. **Test OAuth Flow**: Complete the full OAuth flow
2. **Monitor Logs**: Check Vercel function logs for errors
3. **Update Documentation**: Update any hardcoded URLs
4. **Set up Monitoring**: Configure error tracking and analytics

---

**Ready to deploy?** Follow these steps and your eBay OAuth integration will work in production! 🚀 