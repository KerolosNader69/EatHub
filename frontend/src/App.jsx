import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import IntroSequence from './components/IntroSequence';
import Navigation from './components/Navigation';
import BottomCartBar from './components/BottomCartBar';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import PageViewTracker from './components/PageViewTracker';
import analytics from './utils/analytics';
import errorTracker from './utils/errorTracking';
import './App.css';

// Lazy load route components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const Menu = lazy(() => import('./pages/Menu'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load user auth components
const UserSignup = lazy(() => import('./pages/UserSignup'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const UserSettings = lazy(() => import('./pages/UserSettings'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Feedback = lazy(() => import('./pages/Feedback'));

// Lazy load admin components (separate bundle)
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    // Check if intro has been shown in this session
    return !sessionStorage.getItem('introShown');
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('introShown', 'true');
  };

  // Initialize analytics and error tracking
  useEffect(() => {
    analytics.init();
    errorTracker.init();
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShowIntro(false);
      sessionStorage.setItem('introShown', 'true');
    }
  }, []);

  if (showIntro) {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <IntroSequence onComplete={handleIntroComplete} />
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <PageViewTracker />
            <Suspense fallback={<Loading />}>
              <Routes>
              {/* Customer routes with navigation */}
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={
                <div className="app">
                  <Navigation />
                  <Menu />
                </div>
              } />
              <Route path="/menu/:category" element={
                <div className="app">
                  <Navigation />
                  <Menu />
                </div>
              } />
              <Route path="/cart" element={
                <div className="app">
                  <Navigation />
                  <Cart />
                </div>
              } />
              <Route path="/checkout" element={
                <div className="app">
                  <Navigation />
                  <Checkout />
                </div>
              } />
              <Route path="/order-confirmation" element={
                <div className="app">
                  <Navigation />
                  <OrderConfirmation />
                </div>
              } />
              <Route path="/order-status" element={
                <div className="app">
                  <Navigation />
                  <OrderStatus />
                </div>
              } />
              
              {/* User authentication routes */}
              <Route path="/user/signup" element={<UserSignup />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/settings" element={<UserSettings />} />
              
              {/* Track Order route */}
              <Route path="/track-order" element={<TrackOrder />} />
              
              {/* Feedback route */}
              <Route path="/feedback" element={<Feedback />} />
              
              {/* Admin routes without customer navigation */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* 404 Not Found - catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomCartBar />
          </Suspense>
        </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
