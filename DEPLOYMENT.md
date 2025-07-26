# DNCL eBay Manager - Vercel Deployment Guide

## 🚀 **Deploy to Vercel**

### **Prerequisites**
- Vercel account (free at vercel.com)
- GitHub repository connected to Vercel
- Environment variables configured

### **Step 1: Connect Repository**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `phugialy/dnclebaymanager`
4. Select the repository and click "Deploy"

### **Step 2: Configure Build Settings**

**Framework Preset**: Other
**Root Directory**: `./` (root of project)
**Build Command**: `npm run build`
**Output Directory**: `client/build`
**Install Command**: `npm run install-all`

### **Step 3: Environment Variables**

Add these environment variables in Vercel dashboard:

#### **Production Environment Variables**
```
NODE_ENV=production
PORT=3000
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
JWT_SECRET=your_secure_jwt_secret
DB_PATH=./data/ebay_manager.db
```

#### **Development Environment Variables** (optional)
```
NODE_ENV=development
PORT=5000
EBAY_SANDBOX=true
```

### **Step 4: Deploy**

1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete
3. Your app will be available at: `https://your-project-name.vercel.app`

## 🔧 **Vercel Configuration**

The `vercel.json` file handles:

### **Builds**
- **Backend**: Node.js server at `server/src/index.ts`
- **Frontend**: Static files served from `client/build`

### **Routes**
- `/api/*` → Backend API endpoints
- `/health` → Health check endpoint
- `/*` → Frontend React app

### **Function Settings**
- **Max Duration**: 30 seconds
- **Memory**: 1024MB
- **Runtime**: Node.js

## 📝 **Post-Deployment**

### **1. Test Your Application**
- Visit your Vercel URL
- Test login with credentials:
  - Admin: `dncl` / `adminDNCL@25`
  - Operator: `dnclOperator` / `operatorDNCL@25`

### **2. Configure Custom Domain** (Optional)
1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS records

### **3. Set Up Database**
For production, consider:
- **Vercel Postgres** (recommended)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)

### **4. Environment Variables**
Update your frontend to use the production API URL:
```
REACT_APP_API_URL=https://your-project-name.vercel.app/api
```

## 🔄 **Continuous Deployment**

### **Automatic Deployments**
- Every push to `main` branch triggers deployment
- Preview deployments for pull requests
- Automatic rollback on failed deployments

### **Manual Deployments**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel --prod
```

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Build Fails**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

2. **API Routes Not Working**
   - Check environment variables
   - Verify route configuration in vercel.json
   - Test API endpoints directly

3. **Database Issues**
   - SQLite won't work on Vercel (read-only filesystem)
   - Use external database service
   - Update database connection

4. **Authentication Issues**
   - Check JWT_SECRET environment variable
   - Verify CORS settings
   - Test login flow

### **Debug Commands**
```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs your-project-name

# Test local build
npm run build
```

## 📊 **Monitoring**

### **Vercel Analytics**
- Enable in project settings
- Track performance metrics
- Monitor user interactions

### **Error Tracking**
- Set up error monitoring
- Configure alerts
- Review logs regularly

## 🔒 **Security Considerations**

### **Environment Variables**
- Never commit secrets to Git
- Use Vercel's environment variable system
- Rotate secrets regularly

### **CORS Configuration**
- Update CORS settings for production domain
- Restrict API access as needed
- Monitor for unauthorized requests

### **Authentication**
- Use strong JWT secrets
- Implement proper session management
- Consider OAuth for production

## 📈 **Performance Optimization**

### **Build Optimization**
- Enable Vercel's build cache
- Optimize bundle size
- Use code splitting

### **Runtime Optimization**
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets

---

**Deployment URL**: `https://your-project-name.vercel.app`

**Status**: ✅ Ready for deployment 