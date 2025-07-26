# DNCL eBay Manager Setup Script
Write-Host "Setting up DNCL eBay Manager..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
cd server
npm install
cd ..

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
cd client
npm install
cd ..

# Create environment files
Write-Host "Creating environment files..." -ForegroundColor Yellow

# Server environment
if (!(Test-Path "server\.env")) {
    Copy-Item "server\env.example" "server\.env"
    Write-Host "Created server\.env - Please update with your eBay API credentials" -ForegroundColor Yellow
}

# Client environment
if (!(Test-Path "client\.env")) {
    @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=DNCL eBay Manager
"@ | Out-File -FilePath "client\.env" -Encoding UTF8
    Write-Host "Created client\.env" -ForegroundColor Yellow
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update server\.env with your eBay API credentials" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development servers" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White 