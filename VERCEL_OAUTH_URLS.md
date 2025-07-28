# Vercel OAuth URLs for eBay Integration

## 🎯 **Production OAuth URLs**

Replace `your-app-name.vercel.app` with your actual Vercel domain.

### **1. Accept URL (Success)**
```
https://your-app-name.vercel.app/ebay-auth?userId=USER_ID
```

### **2. Decline URL (Error)**
```
https://your-app-name.vercel.app/ebay-auth?message=ERROR_MESSAGE
```

### **3. Privacy Policy URL**
```
https://your-app-name.vercel.app/privacy
```

### **4. Terms of Service URL**
```
https://your-app-name.vercel.app/terms
```

## 🔧 **eBay Developer Portal Configuration**

### **Required Settings:**

1. **Your auth accepted URL:**
   ```
   https://your-app-name.vercel.app/api/ebay/auth/callback
   ```

2. **Privacy Policy URL:**
   ```
   https://your-app-name.vercel.app/privacy
   ```

3. **Terms of Service URL:**
   ```
   https://your-app-name.vercel.app/terms
   ```

## 📋 **Environment Variables for Vercel**

Add these in your Vercel dashboard under **Settings > Environment Variables**:

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

## 🔄 **OAuth Flow in Production**

1. **User clicks "Connect eBay Account"**
   - Frontend calls: `https://your-app-name.vercel.app/api/ebay/auth/login`
   - Server generates OAuth URL with RuName
   - User redirected to eBay

2. **eBay OAuth Process**
   - User approves on eBay
   - eBay redirects to: `https://your-app-name.vercel.app/api/ebay/auth/callback`

3. **Server Processes Callback**
   - Exchanges code for tokens
   - Stores user data
   - Redirects to success/error URL

4. **Success Redirect**
   - URL: `https://your-app-name.vercel.app/ebay-auth?userId=123`
   - Frontend displays success message

5. **Error Redirect**
   - URL: `https://your-app-name.vercel.app/ebay-auth?message=error`
   - Frontend displays error message

## 🛡️ **Security Notes**

- All URLs use HTTPS (required by eBay)
- RuName is used in OAuth URL (not full redirect URL)
- Actual redirect URL is configured in eBay Developer Portal
- Environment variables are encrypted in Vercel
- CORS is configured for your domain

## ✅ **Deployment Checklist**

- [ ] Update eBay Developer Portal with production URLs
- [ ] Configure environment variables in Vercel
- [ ] Deploy application to Vercel
- [ ] Test OAuth flow end-to-end
- [ ] Verify Privacy Policy and Terms pages are accessible
- [ ] Check that all redirects work correctly

## 🔍 **Testing URLs**

After deployment, test these URLs:

1. **Health Check:** `https://your-app-name.vercel.app/health`
2. **OAuth Health:** `https://your-app-name.vercel.app/api/ebay/auth/health`
3. **Main App:** `https://your-app-name.vercel.app/ebay-auth`
4. **Privacy Policy:** `https://your-app-name.vercel.app/privacy`
5. **Terms of Service:** `https://your-app-name.vercel.app/terms`

---

**Ready for production deployment!** 🚀 