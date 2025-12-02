import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './context/CartContext';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
);

// Register service worker for offline support (optional)
// Uncomment to enable service worker in production
// serviceWorkerRegistration.register({
//   onSuccess: () => console.log('Service worker registered successfully'),
//   onUpdate: () => console.log('New content available, please refresh'),
// });
