# Quick Reference - Eat Hub Admin

## 🚀 Start Servers

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🔑 Admin Login

- **URL:** http://localhost:5173/admin/login
- **Email:** admin@eathub.com
- **Password:** admin123456

## 📋 Common Tasks

### Add Menu Item
1. Go to Admin Dashboard
2. Click "Menu Management"
3. Click "+ Add New Item"
4. Fill in details
5. Upload image (optional)
6. Check "Available for ordering"
7. Click "Add Item"

### Toggle Availability
1. Go to Menu Management
2. Find the item
3. Click the toggle switch
4. Item availability updates instantly

### Manage Orders
1. Go to "Order Management"
2. View all orders
3. Click dropdown to change status:
   - Received → Preparing → Out for Delivery → Delivered
4. Click ▼ to expand order details

### Update Order Status
1. Find the order
2. Select new status from dropdown
3. Status updates automatically

## 🛠️ Maintenance Scripts

```bash
# Reset admin password
node backend/reset-admin.js

# Test connection
node backend/test-supabase.js

# Test all functionality
node test-admin-functionality.js

# Add sample menu items
node backend/seed-menu.js
```

## 🔍 Troubleshooting

### Can't Login?
```bash
node backend/reset-admin.js
```

### No Menu Items?
```bash
node backend/seed-menu.js
```

### Backend Not Working?
```bash
node backend/test-supabase.js
```

### Orders Not Showing?
1. Check backend is running
2. Check browser console for errors
3. Verify you're logged in
4. Click "Refresh" button

## 📱 URLs

- **Frontend:** http://localhost:5173
- **Admin Login:** http://localhost:5173/admin/login
- **Admin Dashboard:** http://localhost:5173/admin/dashboard
- **Backend API:** http://localhost:5000/api
- **Supabase Dashboard:** https://supabase.com/dashboard

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can login to admin panel
- [ ] Can add menu items
- [ ] Can toggle availability
- [ ] Can view orders
- [ ] Can update order status
- [ ] Customer can place orders
- [ ] Orders appear in admin dashboard

## 🎯 Key Features

### Menu Management
- ✅ Create, Read, Update, Delete
- ✅ Image upload & optimization
- ✅ Availability toggle
- ✅ Category management

### Order Management
- ✅ Real-time order viewing
- ✅ Status updates
- ✅ Customer information
- ✅ Order details
- ✅ Auto-refresh (30s)

## 🔐 Security Notes

- Change default admin password in production
- Use HTTPS in production
- Set proper CORS origins
- Keep service keys secret
- Enable rate limiting in production

## 📊 Database Tables

- **menu_items** - All menu items
- **orders** - Customer orders
- **order_items** - Items in each order

## 🎨 Status Flow

```
Received → Preparing → Out for Delivery → Delivered
```

## 💡 Tips

- Use Ctrl+F5 to hard refresh if changes don't appear
- Check browser console for detailed error messages
- Backend logs show all API requests
- Orders auto-refresh every 30 seconds
- Images are automatically optimized
- All changes are instant (no page reload needed)

## 📞 Quick Help

**Issue:** Can't add items  
**Fix:** Check you're logged in, verify token in localStorage

**Issue:** Checkbox not working  
**Fix:** Fixed! Just click the toggle switch

**Issue:** Orders not showing  
**Fix:** Verify backend is running, check auth token

**Issue:** Images not uploading  
**Fix:** Check file size (<5MB), supported formats: jpg, png, webp

## 🎉 Everything Working?

If all checks pass, you're ready to:
- Manage your restaurant menu
- Process customer orders
- Track order status
- Deliver great food! 🍔🍕🥗
