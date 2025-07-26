# Authentication System - DNCL eBay Manager

## Current Implementation (Placeholder)

The application currently uses a simple placeholder authentication system that can be easily replaced with Gmail OAuth.

### Features
- ✅ User login/logout functionality
- ✅ Session persistence (localStorage)
- ✅ Protected routes
- ✅ Loading states
- ✅ Error handling
- ✅ User information display

### Test Credentials
- **Admin User**: `dncl` / `adminDNCL@25`
- **Operator User**: `dnclOperator` / `operatorDNCL@25`

## Architecture

### Components
1. **AuthContext** (`contexts/AuthContext.tsx`)
   - Manages authentication state
   - Handles login/logout logic
   - Provides user information

2. **ProtectedRoute** (`components/ProtectedRoute.tsx`)
   - Wraps protected pages
   - Redirects unauthenticated users to login
   - Shows loading state during auth check

3. **Login** (`pages/Login.tsx`)
   - Login form with validation
   - Error handling
   - Loading states

### User Interface
- Clean, modern login page
- User info displayed in sidebar
- Logout functionality
- Responsive design

## Future Gmail Integration

### To Replace with Gmail OAuth:

1. **Install Google OAuth dependencies:**
   ```bash
   npm install @react-oauth/google
   ```

2. **Update AuthContext:**
   - Replace `PLACEHOLDER_USERS` with Google OAuth
   - Update `login` function to use Google authentication
   - Handle Google user profile data

3. **Update Login component:**
   - Replace form with Google Sign-In button
   - Handle OAuth flow
   - Update error handling

4. **Backend Integration:**
   - Add Google OAuth endpoints
   - Verify Google tokens
   - Store user data in database

### Example Gmail Integration Structure:
```typescript
// In AuthContext
const loginWithGoogle = async (googleToken: string) => {
  // Verify token with Google
  // Get user profile from Google
  // Store in database
  // Set user state
};

// In Login component
<GoogleLogin
  onSuccess={(response) => loginWithGoogle(response.access_token)}
  onError={() => setError('Google login failed')}
/>
```

## Security Notes

- Current system is for development only
- Replace with proper authentication before production
- Implement proper token management
- Add CSRF protection
- Use HTTPS in production

## File Structure
```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── components/
│   ├── ProtectedRoute.tsx       # Route protection
│   └── LoadingSpinner.tsx       # Loading states
├── pages/
│   └── Login.tsx                # Login page
└── App.tsx                      # Main app with auth provider
``` 