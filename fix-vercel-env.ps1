# Fix Vercel Environment Variables for Backend
Write-Host "Setting Vercel environment variables for backend..." -ForegroundColor Green

# Set environment variables for production
vercel env add SUPABASE_URL production
# When prompted, enter: https://opcblscxvueihdkiraqt.supabase.co

vercel env add SUPABASE_ANON_KEY production  
# When prompted, enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ

vercel env add SUPABASE_SERVICE_KEY production
# When prompted, enter: sb_secret_-62WZYmPOxYhVBSIPDW77A_iF3PaUay

Write-Host "Environment variables set. Now redeploying..." -ForegroundColor Green

# Redeploy backend
vercel --prod

Write-Host "Deployment complete! Test the home page now." -ForegroundColor Green