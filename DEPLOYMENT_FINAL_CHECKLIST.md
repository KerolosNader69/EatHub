# Eat Hub - Final Deployment Checklist

Use this checklist to deploy your Eat Hub application step by step.

## ✅ Pre-Deployment (5 minutes)

- [ ] All code is committed to Git
- [ ] Code is pushed to GitHub (main branch)
- [ ] `.env` files are NOT committed (check `.gitignore`)
- [ ] Run verification script:
  - Windows: `.\deploy.ps1`
  - Linux/Mac: `./deploy.sh`
- [ ] Verification script passes all checks

## 📊 Step 1: MongoDB Atlas Setup (5 minutes)

- [ ] Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create account or log in
- [ ] Click "Build a Database"
- [ ] Select **M0 FREE** tier
- [ ] Choose cloud provider and region
- [ ] Click "Create Cluster"
- [ ] Wait for cluster creation (3-5 minutes)

### Database Access
- [ ] Go to "Database Access" → "Add New Database User"
- [ ] Username: `eathub_admin` (or your choice)
- [ ] Click "Autogenerate Secure Password"
- [ ] **SAVE PASSWORD SECURELY**: `_______________________`
- [ ] Privileges: "Read and write to any database"
- [ ] Click "Add User"

### Network Access
- [ ] Go to "Network Access" → "Add IP Address"
- [ ] Click "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Click "Confirm"

### Connection String
- [ ] Go to "Database" → Click "Connect"
- [ ] Select "Connect your application"
- [ ] Copy connection string
- [ ] Replace `<password>` with your actual password
- [ ] Add database name: `/eathub?retryWrites=true&w=majority`
- [ ] **SAVE CONNECTION STRING**: `_______________________`

## 🚂 Step 2: Railway Backend Deployment (5 minutes)

- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Select your Eat Hub repository
- [ ] Wait for initial deployment

### Environment Variables
- [ ] Go to "Variables" tab
- [ ] Add these variables (click "New Variable" for each):

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<paste-your-mongodb-connection-string>
JWT_SECRET=<generate-below>
JWT_EXPIRE=24h
FRONTEND_URL=https://temporary-placeholder.com
```

### Generate JWT Secret
- [ ] Open terminal on your computer
- [ ] Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Copy output
- [ ] Paste as `JWT_SECRET` value
- [ ] **SAVE JWT SECRET**: `_______________________`

### Get Backend URL
- [ ] Go to "Settings" tab
- [ ] Scroll to "Domains" section
- [ ] Copy the Railway URL (e.g., `https://your-app.up.railway.app`)
- [ ] **SAVE BACKEND URL**: `_______________________`
- [ ] Test: Visit `<your-railway-url>/api/health`
- [ ] Should see JSON with `"status": "healthy"`

## ▲ Step 3: Vercel Frontend Deployment (5 minutes)

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Select your Eat Hub repository
- [ ] Click "Import"

### Build Configuration
- [ ] Framework Preset: **Vite** (should auto-detect)
- [ ] Root Directory: Click "Edit" → Enter `frontend`
- [ ] Build Command: `npm run build` (auto-detected)
- [ ] Output Directory: `dist` (auto-detected)

### Environment Variables
- [ ] Expand "Environment Variables"
- [ ] Add these variables:

```
VITE_API_URL=<your-railway-url>/api
VITE_APP_NAME=Eat Hub
```

Example:
```
VITE_API_URL=https://your-app.up.railway.app/api
VITE_APP_NAME=Eat Hub
```

- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)

### Get Frontend URL
- [ ] Copy Vercel URL (e.g., `https://your-app.vercel.app`)
- [ ] **SAVE FRONTEND URL**: `_______________________`
- [ ] Click "Visit" to see your app
- [ ] Verify intro sequence plays

## 🔄 Step 4: Update CORS Configuration (1 minute)

- [ ] Go back to Railway dashboard
- [ ] Open your backend project
- [ ] Go to "Variables" tab
- [ ] Find `FRONTEND_URL` variable
- [ ] Update value to your Vercel URL (e.g., `https://your-app.vercel.app`)
- [ ] **Important**: No trailing slash!
- [ ] Railway will automatically redeploy (wait 1-2 minutes)
- [ ] Verify deployment completes

## 👤 Step 5: Create Admin User (2 minutes)

Choose **ONE** method:

### Method A: Using Script (Recommended)

On your local computer:

```bash
cd backend
node scripts/createAdminUser.js admin YourSecurePassword123!
```

Replace `YourSecurePassword123!` with a strong password.

- [ ] Script runs successfully
- [ ] See "Admin user created successfully!" message
- [ ] **SAVE ADMIN CREDENTIALS**:
  - Username: `_______________________`
  - Password: `_______________________`

### Method B: Manual via MongoDB Atlas

- [ ] On your computer, run:
  ```bash
  cd backend
  node scripts/hashPassword.js YourSecurePassword123!
  ```
- [ ] Copy the hash output
- [ ] Go to MongoDB Atlas → "Browse Collections"
- [ ] Click "Create Database"
  - Database: `eathub`
  - Collection: `users`
- [ ] Click on `users` collection
- [ ] Click "Insert Document"
- [ ] Switch to "JSON View"
- [ ] Paste:
  ```json
  {
    "username": "admin",
    "password": "<paste-hash-here>",
    "role": "admin",
    "createdAt": {"$date": "2024-12-02T00:00:00.000Z"},
    "updatedAt": {"$date": "2024-12-02T00:00:00.000Z"}
  }
  ```
- [ ] Click "Insert"
- [ ] **SAVE ADMIN CREDENTIALS**:
  - Username: `_______________________`
  - Password: `_______________________`

## 🧪 Step 6: Test Deployment (10 minutes)

### Automated Testing

Run the verification script on your computer:

```bash
node verify-deployment.js <your-railway-url> <your-vercel-url>
```

Example:
```bash
node verify-deployment.js https://your-app.railway.app https://your-app.vercel.app
```

- [ ] Backend health check passes
- [ ] Menu endpoint accessible
- [ ] Frontend accessible

### Manual Testing - Frontend

- [ ] Visit your Vercel URL
- [ ] Intro sequence plays correctly
- [ ] Can navigate to Menu page
- [ ] Can navigate to Cart page
- [ ] Can navigate to Order Status page
- [ ] No errors in browser console (F12)

### Manual Testing - Backend API

- [ ] Visit `<railway-url>/api/health` → Returns JSON
- [ ] Visit `<railway-url>/api/menu` → Returns empty array `[]`

### Manual Testing - Admin Login

- [ ] Go to `<vercel-url>/admin/login`
- [ ] Enter admin username and password
- [ ] Successfully logs in
- [ ] Admin dashboard loads
- [ ] Can see "Menu Management" and "Order Management" tabs

### Manual Testing - Admin Add Menu Item

- [ ] Click "Menu Management" tab
- [ ] Click "Add New Item" button
- [ ] Fill out form:
  - Name: Test Pizza
  - Description: Delicious test pizza
  - Price: 12.99
  - Category: Main Courses
  - Upload an image
  - Ingredients: Cheese, Tomato, Dough
  - Portion Size: Large
- [ ] Click "Save" or "Add Item"
- [ ] Item appears in menu list
- [ ] Item shows as "Available"

### Manual Testing - Customer View Menu

- [ ] Go to main menu page (click logo or home)
- [ ] Menu item appears
- [ ] Can click on menu item
- [ ] Detail modal opens
- [ ] Can see full description and ingredients

### Manual Testing - Place Order

- [ ] Click "Add to Cart" on menu item
- [ ] Cart icon shows "1" badge
- [ ] Click cart icon
- [ ] Cart page shows item
- [ ] Click "Proceed to Checkout"
- [ ] Fill out checkout form:
  - Name: Test Customer
  - Phone: 1234567890
  - Address: 123 Test St
  - Special Instructions: Test order
- [ ] Click "Place Order"
- [ ] Order confirmation page appears
- [ ] Shows order number
- [ ] Shows estimated delivery time

### Manual Testing - Admin View Order

- [ ] Go back to admin dashboard
- [ ] Click "Order Management" tab
- [ ] Order appears in list
- [ ] Can see order details
- [ ] Can update order status
- [ ] Status updates successfully

### Manual Testing - Check Order Status

- [ ] Go to Order Status page
- [ ] Enter order number from confirmation
- [ ] Click "Check Status"
- [ ] Order details appear
- [ ] Status shows correctly

## ✅ Deployment Complete!

If all tests pass, your deployment is successful! 🎉

### Record Your URLs

- **Frontend**: `_______________________`
- **Backend**: `_______________________`
- **Admin Panel**: `_______________________`

### Share Your App

Your app is now live! Share these URLs:
- Customers: `<your-vercel-url>`
- Admin: `<your-vercel-url>/admin/login`

## 🔍 Troubleshooting

If any tests fail, check:

### CORS Errors in Browser Console
- [ ] Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
- [ ] No trailing slash in URL
- [ ] Railway has redeployed after updating variable

### Backend Not Responding
- [ ] Check Railway logs for errors
- [ ] Verify all environment variables are set
- [ ] Verify MongoDB connection string is correct
- [ ] Check MongoDB Atlas IP whitelist

### Frontend Not Loading
- [ ] Check Vercel deployment logs
- [ ] Verify build completed successfully
- [ ] Check environment variables are set
- [ ] Clear browser cache and reload

### Admin Login Fails
- [ ] Verify admin user exists in MongoDB
- [ ] Check password is correct
- [ ] Verify JWT_SECRET is set in Railway
- [ ] Check backend logs for authentication errors

### Images Not Uploading
- [ ] Check Railway logs for upload errors
- [ ] Verify Multer is configured correctly
- [ ] Check file size limits

## 📚 Additional Resources

- **Full Guide**: DEPLOYMENT_INSTRUCTIONS.md
- **Troubleshooting**: DEPLOYMENT_TROUBLESHOOTING.md
- **Quick Reference**: QUICK_DEPLOY.md

## 🎯 Next Steps

After successful deployment:

1. [ ] Add more menu items
2. [ ] Test with real orders
3. [ ] Share with stakeholders
4. [ ] Monitor logs for first few days
5. [ ] Consider custom domain (optional)
6. [ ] Set up monitoring alerts (optional)
7. [ ] Configure database backups (optional)

## 📝 Deployment Notes

**Deployment Date**: `_______________________`

**Deployed By**: `_______________________`

**Issues Encountered**:
```
[Note any issues or special configurations here]




```

**Additional Notes**:
```
[Any other relevant information]




```

---

**Congratulations on your deployment!** 🚀🎉

Your Eat Hub application is now live and ready to serve customers!
