# Fix Deployment Script
# This script will help you fix the CORS and deployment issues

Write-Host "=== Eat Hub Deployment Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy Frontend with corrected backend URL
Write-Host "Step 1: Deploying Frontend with corrected backend URL..." -ForegroundColor Yellow
cd frontend
Write-Host "Running: vercel --prod" -ForegroundColor Gray
vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend deployed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Check and set backend environment variables
Write-Host "Step 2: Setting Backend Environment Variables..." -ForegroundColor Yellow
cd ../backend

Write-Host "Setting SUPABASE_URL..." -ForegroundColor Gray
echo "https://opcblscxvueihdkiraqt.supabase.co" | vercel env add SUPABASE_URL production

Write-Host "Setting SUPABASE_ANON_KEY..." -ForegroundColor Gray
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ" | vercel env add SUPABASE_ANON_KEY production

Write-Host "Setting SUPABASE_SERVICE_KEY..." -ForegroundColor Gray
echo "sb_secret_-62WZYmPOxYhVBSIPDW77A_iF3PaUay" | vercel env add SUPABASE_SERVICE_KEY production

Write-Host "Setting JWT_SECRET..." -ForegroundColor Gray
echo "6f5b1bb1f10772a18a9383ec647378b8e4250dd69c93c6004556021523826dcc7d6bbe4b079ec4772d3918d7fd8a4cc4500c5e3a3f3dea15434078dcd146ce1d" | vercel env add JWT_SECRET production

Write-Host "Setting JWT_EXPIRE..." -ForegroundColor Gray
echo "24h" | vercel env add JWT_EXPIRE production

Write-Host "Setting NODE_ENV..." -ForegroundColor Gray
echo "production" | vercel env add NODE_ENV production

Write-Host "Setting LOG_LEVEL..." -ForegroundColor Gray
echo "info" | vercel env add LOG_LEVEL production

Write-Host ""
Write-Host "Environment variables set!" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy Backend
Write-Host "Step 3: Deploying Backend..." -ForegroundColor Yellow
Write-Host "Running: vercel --prod" -ForegroundColor Gray
vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Backend deployed successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Verify deployment
Write-Host "Step 4: Verifying deployment..." -ForegroundColor Yellow
cd ..
node verify-deployment.js

Write-Host ""
Write-Host "=== Deployment Fix Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check the verification results above" -ForegroundColor White
Write-Host "2. Test your application in the browser" -ForegroundColor White
Write-Host "3. Check browser console for any remaining errors" -ForegroundColor White
