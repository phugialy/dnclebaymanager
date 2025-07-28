# eBay OAuth Setup Script
# This script helps configure the eBay OAuth environment

Write-Host "🔧 eBay OAuth Configuration Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if .env file exists
$envPath = "server\.env"
if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists. Backing up..." -ForegroundColor Yellow
    Copy-Item $envPath "$envPath.backup"
}

# Create .env file with template
Write-Host "📝 Creating .env file..." -ForegroundColor Blue

$envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# eBay API Configuration (PRODUCTION)
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
"@

$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit server\.env and add your actual EBAY_CLIENT_SECRET" -ForegroundColor White
Write-Host "2. In your eBay Developer Portal, add this URL to 'Your auth accepted URL':" -ForegroundColor White
Write-Host "   http://localhost:3000/api/ebay/auth/callback" -ForegroundColor Yellow
Write-Host "3. Run 'npm run dev' to start the application" -ForegroundColor White
Write-Host "4. Navigate to http://localhost:3000/ebay-auth to test OAuth" -ForegroundColor White

Write-Host "`n🔍 To test the OAuth URL generation:" -ForegroundColor Cyan
Write-Host "   node server/debug-oauth.js" -ForegroundColor Yellow

Write-Host "`n✅ Setup complete! Remember to configure your eBay Developer Portal." -ForegroundColor Green 