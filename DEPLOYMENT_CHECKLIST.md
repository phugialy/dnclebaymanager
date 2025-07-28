# Deployment Checklist for eBay OAuth

## 🔧 **Environment Configuration**

### **Local Development (.env)**
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# eBay API Configuration (LOCAL)
EBAY_APP_ID=Phuly-DNCLList-PRD-82b57c9de-6d50e473
EBAY_CLIENT_SECRET=your_actual_client_secret_here
EBAY_RUNAME=Phu_Ly-PhuLy-DNCLList--zpmog
EBAY_ACTUAL_REDIRECT_URI=http://localhost:3000/api/ebay/auth/callback
EBAY_SANDBOX=false

# Client Configuration
CLIENT_URL=http://localhost:3000

# Database Configuration
DB_PATH=./data/ebay_manager.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### **Production (Vercel Environment Variables)**
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# eBay API Configuration (PRODUCTION)
EBAY_APP_ID=Phuly-DNCLList-PRD-82b57c9de-6d50e473
EBAY_CLIENT_SECRET=your_actual_client_secret_here
EBAY_RUNAME=Phu_Ly-PhuLy-DNCLList--zpmog
EBAY_ACTUAL_REDIRECT_URI=https://dnclebaymanager.vercel.app/api/ebay/auth/callback
EBAY_SANDBOX=false

# Client Configuration
CLIENT_URL=https://dnclebaymanager.vercel.app

# Database Configuration
DB_PATH=./data/ebay_manager.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## 📋 **eBay Developer Portal Configuration**

### **Required URLs for Production:**
1. **Your auth accepted URL:**
   ```
   https://dnclebaymanager.vercel.app/api/ebay/auth/callback
   ```

2. **Privacy Policy URL:**
   ```
   https://dnclebaymanager.vercel.app/privacy
   ```

3. **Terms of Service URL:**
   ```
   https://dnclebaymanager.vercel.app/terms
   ```

## ✅ **Deployment Checklist**

### **Before Deployment:**
- [ ] Code is committed and pushed to GitHub
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Local OAuth flow works correctly
- [ ] Environment variables are ready for Vercel

### **Vercel Deployment:**
- [ ] Connect repository to Vercel
- [ ] Configure build settings:
  - Framework Preset: Other
  - Root Directory: `./`
  - Build Command: `cd client && npm install && npm run build`
  - Output Directory: `client/build`
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy application

### **eBay Developer Portal:**
- [ ] Update "Your auth accepted URL" with production URL
- [ ] Add Privacy Policy URL
- [ ] Add Terms of Service URL
- [ ] Test OAuth flow with production URLs

### **Post-Deployment Testing:**
- [ ] Health check: `https://dnclebaymanager.vercel.app/health`
- [ ] OAuth health: `https://dnclebaymanager.vercel.app/api/ebay/auth/health`
- [ ] Main app: `https://dnclebaymanager.vercel.app/ebay-auth`
- [ ] Privacy Policy: `https://dnclebaymanager.vercel.app/privacy`
- [ ] Terms of Service: `https://dnclebaymanager.vercel.app/terms`
- [ ] Complete OAuth flow end-to-end

## 🔄 **OAuth Flow URLs**

### **Production OAuth Flow:**
1. **User clicks "Connect eBay Account"**
   - Frontend calls: `https://dnclebaymanager.vercel.app/api/ebay/auth/login`
   - Server generates OAuth URL with RuName
   - User redirected to eBay

2. **eBay OAuth Process**
   - User approves on eBay
   - eBay redirects to: `https://dnclebaymanager.vercel.app/api/ebay/auth/callback`

3. **Server Processes Callback**
   - Exchanges code for tokens
   - Stores user data
   - Redirects to success/error URL

4. **Success Redirect**
   - URL: `https://dnclebaymanager.vercel.app/ebay-auth?userId=123`
   - Frontend displays success message

5. **Error Redirect**
   - URL: `https://dnclebaymanager.vercel.app/ebay-auth?message=error`
   - Frontend displays error message

## 🛠️ **Testing Commands**

### **Local Testing:**
```bash
# Test OAuth URL generation
node server/debug-oauth.js

# Start development server
npm run dev

# Test TypeScript compilation
npx tsc --noEmit
```

### **Production Testing:**
```bash
# Test health endpoints
curl https://dnclebaymanager.vercel.app/health
curl https://dnclebaymanager.vercel.app/api/ebay/auth/health

# Test OAuth flow
# Visit: https://dnclebaymanager.vercel.app/ebay-auth
```

## 🚨 **Important Notes**

1. **Environment Variables**: Never commit sensitive data to repository
2. **HTTPS**: Required for production (eBay requirement)
3. **RuName**: Must use RuName in OAuth URL, not full redirect URL
4. **eBay Portal**: Must update with exact production URLs
5. **Database**: Consider using Vercel's serverless database for production

## 📞 **Support**

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set correctly
3. Confirm eBay Developer Portal URLs match exactly
4. Test OAuth flow step by step

---

**Ready for production deployment!** 🚀 