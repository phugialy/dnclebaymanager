# DNCL eBay Manager

Internal web application for eBay API management and operations.

## Features

- eBay API integration for listing management
- Inventory tracking and updates
- Order processing and fulfillment
- Analytics and reporting dashboard
- Secure internal access only

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (for development, configurable for production)
- **Authentication**: JWT-based internal auth
- **API**: eBay REST APIs

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/phugialy/dnclebaymanager.git
   cd DNCL-Ebay-Manager
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `server/` and `client/` directories
   - Add your eBay API credentials and other configuration

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
dncl-ebay-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
└── shared/                # Shared types and utilities
```

## Development Guidelines

- Follow modular component structure
- Implement proper error handling
- Use TypeScript for type safety
- Write clean, maintainable code
- Test thoroughly before deployment

## Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
JWT_SECRET=your_jwt_secret
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=DNCL eBay Manager
``` 