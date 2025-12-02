# Eat Hub Deployment Script (PowerShell)
# This script helps verify your application is ready for deployment

Write-Host "🚀 Eat Hub Deployment Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pre-Deployment Checklist" -ForegroundColor Yellow
Write-Host ""

# Check for .env files
Write-Host "Checking for .env files... " -NoNewline
if ((Test-Path "backend\.env") -and (Test-Path "frontend\.env")) {
    Write-Host "✓" -ForegroundColor Green
} else {
    Write-Host "✗" -ForegroundColor Red
    Write-Host "⚠️  Warning: .env files not found. Make sure to configure environment variables on hosting platforms." -ForegroundColor Yellow
}

# Check if node_modules exist
Write-Host "Checking backend dependencies... " -NoNewline
if (Test-Path "backend\node_modules") {
    Write-Host "✓" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

Write-Host "Checking frontend dependencies... " -NoNewline
if (Test-Path "frontend\node_modules") {
    Write-Host "✓" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
}

# Test frontend build
Write-Host "Testing frontend build... " -NoNewline
Push-Location frontend
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓" -ForegroundColor Green
    Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
} else {
    Write-Host "✗" -ForegroundColor Red
    Write-Host "❌ Frontend build failed. Fix errors before deploying." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "✅ Pre-deployment checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub"
Write-Host "2. Follow QUICK_DEPLOY.md for deployment instructions"
Write-Host "3. Use PRODUCTION_CHECKLIST.md to track your progress"
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - QUICK_DEPLOY.md - Fast deployment guide (20 min)"
Write-Host "   - DEPLOYMENT_GUIDE.md - Comprehensive guide"
Write-Host "   - PRODUCTION_CHECKLIST.md - Step-by-step checklist"
Write-Host "   - DEPLOYMENT_TROUBLESHOOTING.md - Common issues"
Write-Host ""
