# Complete Project Redeployment Script
Write-Host "🚀 Starting complete project redeployment..." -ForegroundColor Green

# Step 1: Deploy Backend with Environment Variables
Write-Host "`n📦 Deploying Backend..." -ForegroundColor Yellow
Set-Location backend

# Check if vercel is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Deploy backend to production
Write-Host "Deploying backend to Vercel..." -ForegroundColor Cyan
vercel --prod --yes

# Step 2: Deploy Frontend
Write-Host "`n📦 Deploying Frontend..." -ForegroundColor Yellow
Set-Location ../frontend

# Build and deploy frontend
Write-Host "Building and deploying frontend..." -ForegroundColor Cyan
vercel --prod --yes

# Step 3: Test Deployment
Write-Host "`n🧪 Testing deployment..." -ForegroundColor Yellow
Set-Location ..

# Test backend endpoints
Write-Host "Testing backend endpoints..." -ForegroundColor Cyan
node test-fixed-endpoints.js

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Frontend: https://eat-hub-frontend.vercel.app" -ForegroundColor Cyan
Write-Host "Backend: https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app" -ForegroundColor Cyan