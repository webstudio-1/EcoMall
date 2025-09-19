import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartWishlistProvider } from './context/CartWishlistContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <CartWishlistProvider>
          <App />
        </CartWishlistProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
