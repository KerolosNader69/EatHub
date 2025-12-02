# Eat Hub Web Application

A web application for a home-based cloud kitchen that enables customers to browse menu items, place orders online, and arrange delivery.

## Project Structure

```
EatHub/
├── frontend/          # React frontend application (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # Global styles
│   │   ├── context/       # React Context providers
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
│
├── backend/           # Node.js/Express backend API
│   ├── config/        # Configuration files
│   ├── models/        # Mongoose models
│   ├── controllers/   # Route controllers
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── uploads/       # Uploaded files
│
└── .kiro/            # Kiro specs and documentation
    └── specs/
        └── eat-hub-webapp/
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration:
   - Set your MongoDB connection string
   - Set a secure JWT secret
   - Configure other environment variables as needed

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your API URL (default: `http://localhost:5000/api`)

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Technology Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- CSS Modules

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (file uploads)

## Brand Colors

- Primary Black: #000000
- Primary White: #FFFFFF
- Accent Red: #C41E3A

## Development

### Code Style

Both frontend and backend use ESLint and Prettier for code consistency. Configuration files are included in each directory.

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Performance Testing

The application includes comprehensive performance testing tools to ensure optimal user experience.

### Quick Performance Audit

Run automated API performance tests:

```bash
npm run audit:simple
```

This will:
- Test API response times (target: <500ms)
- Generate performance reports
- Provide manual testing instructions for Lighthouse, page load, and FPS

### Manual Performance Tests

1. **Lighthouse Audit** (Target: ≥90/100)
   - Open DevTools → Lighthouse tab
   - Run audit with 4G throttling
   - See `README_PERFORMANCE_TESTING.md` for details

2. **Page Load Time** (Target: <3000ms)
   - Use Network tab with 4G throttling
   - Measure load time over 3 runs
   - Calculate average

3. **Animation FPS** (Target: 60 FPS)
   - Use Performance tab to record intro
   - Verify smooth 60 FPS animation
   - Check for frame drops

### Performance Reports

All test results are saved to `./performance-reports/`

For detailed testing instructions, see:
- `README_PERFORMANCE_TESTING.md` - Quick testing guide
- `PERFORMANCE_AUDIT_RESULTS.md` - Detailed results and analysis

### Performance Targets

✅ API Response: <500ms (Currently: ~9ms)  
✅ Lighthouse Score: ≥90/100  
✅ Page Load: <3000ms on 4G  
✅ Animation: 60 FPS  
✅ Initial Bundle: <200KB  

## Deployment

### 🚀 Ready to Deploy?

Your application is **fully prepared for production deployment**!

**Start here:** `DEPLOYMENT_READY.md` - Complete deployment overview

### Quick Links

| Guide | Time | Best For |
|-------|------|----------|
| `QUICK_DEPLOY.md` | 20 min | Fast deployment |
| `DEPLOYMENT_GUIDE.md` | 45 min | Detailed walkthrough |
| `PRODUCTION_CHECKLIST.md` | - | Step-by-step tracking |
| `DEPLOYMENT_TROUBLESHOOTING.md` | - | Problem solving |

### Deployment Stack (Free Tier)

- **Frontend:** Vercel (Free subdomain + SSL)
- **Backend:** Railway ($5 free credit/month)
- **Database:** MongoDB Atlas (512 MB free)

**Total Cost: $0/month** within free tier limits

### What's Included

✅ Environment configuration templates  
✅ Platform setup files (Vercel, Railway)  
✅ Admin user creation scripts  
✅ Health check endpoints  
✅ Comprehensive documentation  
✅ Troubleshooting guides  

### Quick Start

```bash
# 1. Verify deployment readiness
./deploy.sh  # or deploy.ps1 on Windows

# 2. Follow quick deploy guide
# Open QUICK_DEPLOY.md

# 3. Your app will be live in ~20 minutes!
```

### Production URLs

After deployment, update with your live URLs:

- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-app.railway.app`
- **Admin Panel:** `https://your-app.vercel.app/admin/login`

## License

ISC
