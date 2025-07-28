# eBay OAuth Implementation Guide

## 🎯 **What We Built**

✅ **Proper OAuth Authorization Code Flow with RuName**
- **Backend**: Complete OAuth service with token management using eBay RuName
- **Frontend**: Clean OAuth authentication UI
- **Database**: Secure token storage with automatic refresh
- **Security**: Token revocation and proper error handling
- **eBay Compliance**: Uses RuName for OAuth flow as required by eBay

## 🔄 **OAuth Flow Implementation**

### **Step 1: Authorization URL Generation**
```
GET /api/ebay/auth/login
```
- Generates eBay OAuth authorization URL
- Includes state parameter for security
- Redirects user to eBay for approval

### **Step 2: OAuth Callback Handling**
```
GET /api/ebay/auth/callback?code=AUTH_CODE&state=STATE
```
- Receives authorization code from eBay
- Exchanges code for access/refresh tokens
- Stores tokens securely in database
- Fetches and stores user information

### **Step 3: Token Management**
```
GET /api/ebay/auth/tokens?userId=USER_ID
```
- Retrieves stored tokens
- Automatically refreshes expired tokens
- Returns valid access token for API calls

### **Step 4: User Information**
```
GET /api/ebay/auth/user?userId=USER_ID
```
- Retrieves stored user information
- Includes eBay username, email, account type

### **Step 5: Logout**
```
POST /api/ebay/auth/logout
```
- Revokes tokens on eBay servers
- Removes tokens from database
- Clears local storage

## 🔧 **Environment Configuration**

Create `server/.env` with these variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# eBay API Configuration (PRODUCTION)
EBAY_APP_ID=your_ebay_app_id_here
EBAY_CLIENT_SECRET=your_ebay_client_secret_here
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

### **Important eBay Configuration Notes:**

1. **RuName**: This is your eBay RuName (e.g., `Phu_Ly-PhuLy-DNCLList--zpmog`) that you use in the OAuth URL
2. **Actual Redirect URI**: This is the actual URL where eBay will redirect after authentication
3. **eBay Developer Portal**: You must add `http://localhost:3000/api/ebay/auth/callback` to your "Your auth accepted URL" field

## 📁 **Files Created/Modified**

### **Backend Services**
- `server/src/services/ebayOAuthService.ts` - Complete OAuth service
- `server/src/services/tokenStorageService.ts` - Secure token storage
- `server/src/routes/ebayOAuth.ts` - OAuth API endpoints
- `server/src/index.ts` - Updated with OAuth routes

### **Frontend**
- `client/src/pages/EbayAuth.tsx` - OAuth authentication UI
- `client/src/App.tsx` - Added OAuth route
- `client/src/components/Layout.tsx` - Added OAuth navigation

### **Database Tables**
- `ebay_tokens` - Stores access/refresh tokens
- `ebay_users` - Stores user information

## 🚀 **How to Use**

### **1. Setup eBay Developer Account**
1. Go to [eBay Developer Portal](https://developer.ebay.com/)
2. Create a new application
3. **Important**: Add `http://localhost:3000/api/ebay/auth/callback` to your "Your auth accepted URL" field
4. Copy App ID and Client Secret
5. Note your RuName (e.g., `Phu_Ly-PhuLy-DNCLList--zpmog`)

### **2. Configure Environment**
```bash
# Copy example file
cp server/env.example server/.env

# Edit with your credentials
EBAY_APP_ID=your_actual_app_id
EBAY_CLIENT_SECRET=your_actual_client_secret
EBAY_RUNAME=your_actual_ru_name
```

### **3. Start the Application**
```bash
npm run dev
```

### **4. Authenticate with eBay**
1. Navigate to `/ebay-auth`
2. Click "Connect eBay Account"
3. Approve on eBay
4. Return to app with authenticated session

## 🔍 **API Endpoints**

### **OAuth Flow**
```
GET  /api/ebay/auth/login          # Initiate OAuth
GET  /api/ebay/auth/callback       # Handle OAuth callback
GET  /api/ebay/auth/tokens         # Get user tokens
GET  /api/ebay/auth/user           # Get user info
POST /api/ebay/auth/logout         # Logout user
GET  /api/ebay/auth/health         # Health check
```

### **Response Formats**

**OAuth Login Response:**
```json
{
  "success": true,
  "authUrl": "https://auth.ebay.com/oauth2/authorize?client_id=YOUR_APP_ID&redirect_uri=YOUR_RUNAME&response_type=code&scope=https://api.ebay.com/oauth/api_scope&state=random_state_string",
  "state": "random_state_string"
}
```

**Note**: The `redirect_uri` in the OAuth URL uses your RuName, not the full URL.

**Token Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "expiresAt": "2024-01-15T10:30:00.000Z",
    "isExpired": false
  }
}
```

**User Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "ebayUserId": "123456",
    "username": "ebay_user",
    "email": "user@example.com",
    "accountType": "INDIVIDUAL",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

## 🛡️ **Security Features**

### **Token Management**
- ✅ Automatic token refresh (5 minutes before expiry)
- ✅ Secure token storage in database
- ✅ Token revocation on logout
- ✅ State parameter validation

### **Error Handling**
- ✅ Comprehensive error messages
- ✅ Graceful degradation
- ✅ Proper HTTP status codes
- ✅ Detailed logging

### **Database Security**
- ✅ Encrypted token storage
- ✅ Automatic cleanup of expired tokens
- ✅ User data protection

## 🔄 **Token Lifecycle**

1. **Authorization**: User approves app → Get authorization code
2. **Exchange**: Code → Access token (2 hours) + Refresh token (18 months)
3. **Storage**: Tokens stored securely in database
4. **Usage**: Access token used for API calls
5. **Refresh**: Automatic refresh when token expires
6. **Revocation**: Tokens revoked on logout

## 🧪 **Testing**

### **Health Check**
```bash
curl http://localhost:5000/api/ebay/auth/health
```

### **Manual OAuth Flow**
1. Start server and client
2. Navigate to `http://localhost:3000/ebay-auth`
3. Click "Connect eBay Account"
4. Complete OAuth flow on eBay
5. Verify successful authentication

## 🚨 **Important Notes**

- **RuName**: Must use your eBay RuName in the OAuth URL (not the full redirect URL)
- **Actual Redirect URI**: Must be configured in eBay Developer Portal under "Your auth accepted URL"
- **HTTPS**: Required for production (eBay requirement)
- **Rate Limits**: Respect eBay API rate limits
- **Token Security**: Never expose tokens in logs or client
- **Sandbox**: Use `EBAY_SANDBOX=true` for testing

## 🔄 **Next Steps**

Once OAuth is working:
- ✅ Integrate with existing listing services
- ✅ Add user-specific data filtering
- ✅ Implement role-based access
- ✅ Add multi-user support
- ✅ Create admin dashboard

---

**Ready to implement?** Follow the setup guide and start authenticating with eBay! 🚀 