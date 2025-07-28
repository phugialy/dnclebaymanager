require('dotenv').config();

const EbayOAuthService = require('./dist/services/ebayOAuthService').default;

const oauthService = new EbayOAuthService({
  appId: process.env.EBAY_APP_ID,
  clientSecret: process.env.EBAY_CLIENT_SECRET,
  ruName: process.env.EBAY_RUNAME,
  actualRedirectUri: process.env.EBAY_ACTUAL_REDIRECT_URI,
  sandbox: process.env.EBAY_SANDBOX === 'true',
});

const authUrl = oauthService.buildAuthUrl('test-state');

console.log('Generated OAuth URL:');
console.log(authUrl);
console.log('\nEnvironment variables:');
console.log('EBAY_APP_ID:', process.env.EBAY_APP_ID);
console.log('EBAY_REDIRECT_URI:', process.env.EBAY_REDIRECT_URI);
console.log('EBAY_SANDBOX:', process.env.EBAY_SANDBOX); 