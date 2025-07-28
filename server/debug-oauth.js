require('dotenv').config();

console.log('🔧 Current Environment Variables:');
console.log('EBAY_APP_ID:', process.env.EBAY_APP_ID);
console.log('EBAY_RUNAME:', process.env.EBAY_RUNAME);
console.log('EBAY_ACTUAL_REDIRECT_URI:', process.env.EBAY_ACTUAL_REDIRECT_URI);
console.log('EBAY_SANDBOX:', process.env.EBAY_SANDBOX);
console.log('CLIENT_URL:', process.env.CLIENT_URL);

// Manually construct the OAuth URL using RuName
const appId = process.env.EBAY_APP_ID;
const ruName = process.env.EBAY_RUNAME;
const scope = 'https://api.ebay.com/oauth/api_scope';
const state = 'test-state';

const params = new URLSearchParams({
  client_id: appId,
  redirect_uri: ruName, // Use RuName instead of full URL
  response_type: 'code',
  scope: scope,
  state: state
});

const authUrl = `https://auth.ebay.com/oauth2/authorize?${params.toString()}`;

console.log('\n🌐 Generated OAuth URL:');
console.log(authUrl);

console.log('\n📋 URL Components:');
console.log('- client_id:', appId);
console.log('- redirect_uri (RuName):', ruName);
console.log('- scope:', scope);
console.log('- state:', state);

console.log('\n📝 Environment Comparison:');
console.log('LOCAL:');
console.log('  - EBAY_ACTUAL_REDIRECT_URI: http://localhost:3000/api/ebay/auth/callback');
console.log('  - CLIENT_URL: http://localhost:3000');
console.log('\nPRODUCTION (Vercel):');
console.log('  - EBAY_ACTUAL_REDIRECT_URI: https://dnclebaymanager.vercel.app/api/ebay/auth/callback');
console.log('  - CLIENT_URL: https://dnclebaymanager.vercel.app');

console.log('\n⚠️  Note: eBay will redirect to the actual URL configured in your eBay Developer Portal');
console.log('   Make sure to update eBay Developer Portal with the correct production URLs!'); 