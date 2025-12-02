#!/bin/bash

# Eat Hub Deployment Script
# This script helps verify your application is ready for deployment

echo "🚀 Eat Hub Deployment Verification"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo "📋 Pre-Deployment Checklist"
echo ""

# Check for .env files
echo -n "Checking for .env files... "
if [ -f "backend/.env" ] && [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}⚠️  Warning: .env files not found. Make sure to configure environment variables on hosting platforms.${NC}"
fi

# Check if node_modules exist
echo -n "Checking backend dependencies... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠️  Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

echo -n "Checking frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

# Test backend build
echo -n "Testing backend startup... "
cd backend
if node -e "require('./server.js')" 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may have issues (check manually)${NC}"
fi
cd ..

# Test frontend build
echo -n "Testing frontend build... "
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    rm -rf dist
else
    echo -e "${RED}✗${NC}"
    echo -e "${RED}❌ Frontend build failed. Fix errors before deploying.${NC}"
    cd ..
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}✅ Pre-deployment checks passed!${NC}"
echo ""
echo "📚 Next Steps:"
echo "1. Push your code to GitHub"
echo "2. Follow QUICK_DEPLOY.md for deployment instructions"
echo "3. Use PRODUCTION_CHECKLIST.md to track your progress"
echo ""
echo "📖 Documentation:"
echo "   - QUICK_DEPLOY.md - Fast deployment guide (20 min)"
echo "   - DEPLOYMENT_GUIDE.md - Comprehensive guide"
echo "   - PRODUCTION_CHECKLIST.md - Step-by-step checklist"
echo "   - DEPLOYMENT_TROUBLESHOOTING.md - Common issues"
echo ""
