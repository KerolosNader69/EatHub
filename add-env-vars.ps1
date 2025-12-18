# PowerShell script to add environment variables to Vercel
# Run this from the project root directory

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Vercel Environment Variables Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Backend Environment Variables
Write-Host "Setting up BACKEND environment variables..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend

# SUPABASE_URL
Write-Host "Adding SUPABASE_URL..." -ForegroundColor Green
"https://opcblscxvueihdkiraqt.supabase.co" | vercel env add SUPABASE_URL production

# SUPABASE_ANON_KEY
Write-Host "Adding SUPABASE_ANON_KEY..." -ForegroundColor Green
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ" | vercel env add SUPABASE_ANON_KEY production

# NODE_ENV
Write-Host "Adding NODE_ENV..." -ForegroundColor Green
"production" | vercel env add NODE_ENV production

# JWT_SECRET
Write-Host "Adding JWT_SECRET..." -ForegroundColor Green
"6f5b1bb1f10772a18a9383ec647378b8e4250dd69c93c6004556021523826dcc7d6bbe4b079ec4772d3918d7fd8a4cc4500c5e3a3f3dea15434078dcd146ce1d" | vercel env add JWT_SECRET production

# JWT_EXPIRE
Write-Host "Adding JWT_EXPIRE..." -ForegroundColor Green
"24h" | vercel env add JWT_EXPIRE production

Write-Host ""
Write-Host "Backend environment variables added!" -ForegroundColor Green
Write-Host "Redeploying backend..." -ForegroundColor Yellow
vercel --prod --yes

Set-Location ..

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Frontend Environment Variables
Write-Host "Setting up FRONTEND environment variables..." -ForegroundColor Yellow
Write-Host ""

Set-Location frontend

# VITE_API_URL
Write-Host "Adding VITE_API_URL..." -ForegroundColor Green
"https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app/api" | vercel env add VITE_API_URL production

# VITE_SUPABASE_URL
Write-Host "Adding VITE_SUPABASE_URL..." -ForegroundColor Green
"https://opcblscxvueihdkiraqt.supabase.co" | vercel env add VITE_SUPABASE_URL production

# VITE_SUPABASE_ANON_KEY
Write-Host "Adding VITE_SUPABASE_ANON_KEY..." -ForegroundColor Green
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ" | vercel env add VITE_SUPABASE_ANON_KEY production

# VITE_APP_NAME
Write-Host "Adding VITE_APP_NAME..." -ForegroundColor Green
"Eat Hub" | vercel env add VITE_APP_NAME production

Write-Host ""
Write-Host "Frontend environment variables added!" -ForegroundColor Green
Write-Host "Redeploying frontend..." -ForegroundColor Yellow
vercel --prod --yes

Set-Location ..

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ COMPLETE!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app should now be fully functional!" -ForegroundColor Green
Write-Host "Visit: https://eathub-4tvaxkixs-kerolosnader69s-projects.vercel.app" -ForegroundColor Cyan
Write-Host ""
