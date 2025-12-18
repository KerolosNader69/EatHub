# 🚀 Startup Checklist - Eat Hub

## Pre-Flight Check

Before starting the application, ensure:

- [ ] Node.js installed (v14 or higher)
- [ ] npm installed
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Environment files configured

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start Backend Server

```bash
# Open Terminal 1
cd backend
node server.js
```

**Expected Output:**
```
✅ Starting Eat Hub API server with Supabase
✅ Server running on port 5000
```

**Verify:**
- [ ] No error messages
- [ ] Port 5000 is listening
- [ ] "Server running" message appears

---

### Step 2: Start Frontend Server

```bash
# Open Terminal 2 (new terminal)
cd frontend
npm run dev
```

**Expected Output:**
```
✅ VITE v7.2.6 ready in 334 ms
✅ Local: http://localhost:5173/
```

**Verify:**
- [ ] No error messages
- [ ] Port 5173 is listening
- [ ] Vite dev server running

---

### Step 3: Login to Admin Panel

1. **Open Browser:**
   ```
   http://localhost:5173/admin/login
   ```

2. **Enter Credentials:**
   ```
   Email: admin@eathub.com
   Password: admin123456
   ```

3. **Click Login**

**Expected Result:**
- [ ] Redirected to `/admin/dashboard`
- [ ] See "Menu Management" and "Order Management" tabs
- [ ] No error messages

---

## ✅ Verification Steps

### 1. Test Menu Management

- [ ] Click "Menu Management" tab
- [ ] See 6 sample menu items
- [ ] Click "+ Add New Item" button
- [ ] Form opens successfully
- [ ] Click toggle switch on any item
- [ ] Item availability changes instantly

### 2. Test Order Management

- [ ] Click "Order Management" tab
- [ ] See order list (may be empty initially)
- [ ] Click "Refresh" button
- [ ] No errors appear

### 3. Test Customer Flow

1. **Open new browser tab:**
   ```
   http://localhost:5173
   ```

2. **Browse Menu:**
   - [ ] See menu items
   - [ ] Items have images, prices, descriptions

3. **Add to Cart:**
   - [ ] Click "Add to Cart" on any item
   - [ ] Cart icon shows count
   - [ ] Click cart icon
   - [ ] See items in cart

4. **Checkout:**
   - [ ] Click "Proceed to Checkout"
   - [ ] Fill in customer information
   - [ ] Click "Place Order"
   - [ ] See order confirmation with order number

5. **Verify in Admin:**
   - [ ] Go back to admin panel
   - [ ] Click "Order Management"
   - [ ] See the new order
   - [ ] Order shows customer name and items

---

## 🔧 Troubleshooting

### Backend Won't Start

**Problem:** Port 5000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

---

### Frontend Won't Start

**Problem:** Port 5173 already in use

**Solution:**
```bash
# Vite will automatically try next available port
# Or manually specify:
npm run dev -- --port 5174
```

---

### Can't Login

**Problem:** "Invalid credentials" error

**Solution:**
```bash
# Reset admin password
node backend/reset-admin.js

# Then try login again with:
# Email: admin@eathub.com
# Password: admin123456
```

---

### No Menu Items

**Problem:** Empty menu list

**Solution:**
```bash
# Seed sample menu items
node backend/seed-menu.js
```

---

### Orders Not Showing

**Problem:** Empty order list in admin

**Possible Causes:**
1. Not logged in - Check if you see "Invalid token" in console
2. No orders yet - Place a test order from customer side
3. Token expired - Logout and login again

**Solution:**
```bash
# Verify system is working
node verify-complete-system.js

# Should show:
# ✅ ALL SYSTEMS OPERATIONAL!
```

---

## 🧪 Run Tests

### Quick System Check

```bash
node verify-complete-system.js
```

**Expected Output:**
```
✅ Backend server is running
✅ Frontend server is running
✅ Database connection working
✅ Admin authentication working
✅ Admin authorization working
✅ Menu CRUD operations working
✅ Order creation working
```

---

### Full Functionality Test

```bash
node test-admin-functionality.js
```

**Expected Output:**
```
✅ Admin Login
✅ Token Verification
✅ Get Menu Items (Public)
✅ Create Menu Item (Admin)
✅ Update Menu Item Availability
✅ Create Order
✅ Get All Orders (Admin)
✅ Update Order Status
✅ Delete Menu Item (Admin)

✅ ALL TESTS PASSED!
```

---

## 📋 Daily Startup Routine

### Morning Startup

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev

# Browser
# Open: http://localhost:5173/admin/login
# Login with admin credentials
```

### Verify Everything Works

```bash
# Terminal 3 - Run verification
node verify-complete-system.js
```

---

## 🎯 Success Indicators

### Backend Running ✅
```
✅ "Server running on port 5000" message
✅ No error messages in console
✅ Can access http://localhost:5000
```

### Frontend Running ✅
```
✅ "VITE ready" message
✅ No error messages in console
✅ Can access http://localhost:5173
```

### Admin Panel Working ✅
```
✅ Can login successfully
✅ See dashboard with tabs
✅ Menu items load
✅ Orders load (if any exist)
✅ Can add/edit/delete items
✅ Checkbox toggles work
```

### Customer Side Working ✅
```
✅ Menu displays
✅ Can add to cart
✅ Can checkout
✅ Order confirmation shows
✅ Order appears in admin
```

---

## 🚨 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Backend won't start | Check port 5000, restart |
| Frontend won't start | Check port 5173, restart |
| Can't login | Run `node backend/reset-admin.js` |
| No menu items | Run `node backend/seed-menu.js` |
| Orders not showing | Logout and login again |
| Checkbox not working | Hard refresh (Ctrl+F5) |
| Token expired | Logout and login again |

---

## 📞 Need Help?

### Check Documentation
1. `QUICK_REFERENCE.md` - Common tasks
2. `ADMIN_SETUP_GUIDE.md` - Detailed setup
3. `COMPREHENSIVE_FIX_SUMMARY.md` - All fixes explained

### Run Diagnostics
```bash
# Test Supabase connection
node backend/test-supabase.js

# Test authentication
node backend/test-login.js

# Test complete system
node verify-complete-system.js
```

### Check Logs
- Backend logs in Terminal 1
- Frontend logs in Terminal 2
- Browser console (F12)

---

## ✅ Ready to Go!

If all checks pass:

```
╔════════════════════════════════════════╗
║                                        ║
║   ✅ SYSTEM READY                      ║
║                                        ║
║   Backend:  http://localhost:5000     ║
║   Frontend: http://localhost:5173     ║
║   Admin:    /admin/login              ║
║                                        ║
║   Email:    admin@eathub.com          ║
║   Password: admin123456               ║
║                                        ║
║   🎉 Happy Managing! 🎉               ║
║                                        ║
╚════════════════════════════════════════╝
```

---

**Pro Tip:** Keep both terminal windows visible so you can monitor logs in real-time!
