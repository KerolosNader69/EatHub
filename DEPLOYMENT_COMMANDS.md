# Eat Hub - Deployment Commands Reference

Quick reference for all deployment-related commands.

---

## Pre-Deployment

### Test Backend Locally
```bash
cd backend
npm install
npm start
```

### Test Frontend Locally
```bash
cd frontend
npm install
npm run build
npm run preview
```

### Run Pre-Deployment Verification

**Windows:**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## MongoDB Atlas

### Generate Connection String Format
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/eathub?retryWrites=true&w=majority
```

Replace:
- `USERNAME` - Your database username
- `PASSWORD` - Your database password
- `CLUSTER` - Your cluster identifier

---

## Railway (Backend)

### Environment Variables to Set
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<generated-secret>
JWT_EXPIRE=24h
FRONTEND_URL=<your-vercel-url>
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Backend Health
```bash
curl https://your-app.railway.app/api/health
```

Or visit in browser:
```
https://your-app.railway.app/api/health
```

---

## Vercel (Frontend)

### Environment Variables to Set
```bash
VITE_API_URL=<your-railway-url>/api
VITE_APP_NAME=Eat Hub
```

### Test Frontend Build Locally
```bash
cd frontend
npm run build
npm run preview
```

---

## Create Admin User

### Option A: Using Script (Recommended)

**Windows:**
```powershell
cd backend
$env:MONGODB_URI="<your-production-mongodb-uri>"
node scripts/createAdminUser.js admin YourSecurePassword123!
```

**Linux/Mac:**
```bash
cd backend
export MONGODB_URI="<your-production-mongodb-uri>"
node scripts/createAdminUser.js admin YourSecurePassword123!
```

### Option B: Generate Password Hash
```bash
cd backend
node scripts/hashPassword.js YourSecurePassword123!
```

Then manually insert into MongoDB Atlas.

---

## Verify Deployment

### Run Verification Script
```bash
node verify-deployment.js <backend-url> <frontend-url>
```

**Example:**
```bash
node verify-deployment.js https://eat-hub.railway.app https://eat-hub.vercel.app
```

### Manual Verification

**Test Backend Health:**
```bash
curl https://your-app.railway.app/api/health
```

**Test Backend Menu:**
```bash
curl https://your-app.railway.app/api/menu
```

**Test Frontend:**
```bash
curl https://your-app.vercel.app
```

---

## Git Commands

### Commit and Push Changes
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Check Git Status
```bash
git status
```

### View Recent Commits
```bash
git log --oneline -5
```

---

## Troubleshooting Commands

### Check Backend Logs (Railway)
- Go to Railway Dashboard
- Click on your project
- View "Deployments" tab
- Click on latest deployment
- View logs

### Check Frontend Logs (Vercel)
- Go to Vercel Dashboard
- Click on your project
- View "Deployments" tab
- Click on latest deployment
- View build logs

### Test MongoDB Connection Locally
```bash
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(err => console.error('Error:', err.message));"
```

### Check Node Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies

**Backend:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Database Commands

### Connect to MongoDB Atlas via CLI (Optional)
```bash
mongosh "mongodb+srv://CLUSTER.xxxxx.mongodb.net/eathub" --username USERNAME
```

### View Collections
```javascript
show collections
```

### View Users
```javascript
db.users.find()
```

### View Menu Items
```javascript
db.menuitems.find()
```

### View Orders
```javascript
db.orders.find()
```

### Delete Test Data (Careful!)
```javascript
db.orders.deleteMany({})
db.menuitems.deleteMany({})
```

---

## Performance Testing

### Run Lighthouse Audit
```bash
npm run audit
```

Or:
```bash
node performance-audit.js https://your-app.vercel.app
```

### Simple Performance Check
```bash
npm run audit:simple
```

---

## Maintenance Commands

### Update Dependencies

**Backend:**
```bash
cd backend
npm update
npm audit fix
```

**Frontend:**
```bash
cd frontend
npm update
npm audit fix
```

### Check for Outdated Packages
```bash
npm outdated
```

### Security Audit
```bash
npm audit
```

---

## Backup Commands

### Export MongoDB Data
```bash
mongodump --uri="mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/eathub"
```

### Import MongoDB Data
```bash
mongorestore --uri="mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/eathub" dump/
```

---

## Environment Variables Reference

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eathub
JWT_SECRET=your_64_character_secret_here
JWT_EXPIRE=24h
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-app.railway.app/api
VITE_APP_NAME=Eat Hub
```

---

## Quick Deployment Checklist

```bash
# 1. Test locally
cd backend && npm install && npm start
cd ../frontend && npm install && npm run build

# 2. Run pre-deployment script
./deploy.sh  # or .\deploy.ps1 on Windows

# 3. Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main

# 4. Deploy to platforms (via web interfaces)
# - MongoDB Atlas: Create cluster and get connection string
# - Railway: Connect repo, set env vars
# - Vercel: Connect repo, set env vars

# 5. Create admin user
cd backend
export MONGODB_URI="<production-uri>"
node scripts/createAdminUser.js admin SecurePassword123!

# 6. Verify deployment
node verify-deployment.js <backend-url> <frontend-url>
```

---

## Useful URLs

### Platform Dashboards
- **Railway**: https://railway.app/dashboard
- **Vercel**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com

### Platform Status Pages
- **Railway Status**: https://status.railway.app
- **Vercel Status**: https://www.vercel-status.com
- **MongoDB Status**: https://status.mongodb.com

### Documentation
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Vite Docs**: https://vitejs.dev
- **Express Docs**: https://expressjs.com

---

## Support

If you encounter issues:

1. Check platform status pages
2. Review deployment logs
3. Verify environment variables
4. Check DEPLOYMENT_TROUBLESHOOTING.md
5. Test locally to isolate issue

---

**Last Updated**: December 2, 2024
