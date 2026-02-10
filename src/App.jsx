/**
 * Avira Vastra - Premium Saree E-Commerce
 * Complete E-commerce Application with Routing
 */

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layout
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Preloader from './components/Preloader';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailedPage from './pages/OrderFailedPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import ContactPage from './pages/ContactPage';
import StoryPage from './pages/StoryPage';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminTaxonomy from './pages/AdminTaxonomy';
import AdminUsers from './pages/AdminUsers';
import AdminContent from './pages/AdminContent';

// Hooks
import { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="app">
          <ScrollToTop />

          <Routes>
            {/* Public Layout Group */}
            <Route element={
              <>
                <Header onMenuOpen={handleMenuOpen} isScrolled={isScrolled} />
                <MobileMenu isOpen={isMenuOpen} onClose={handleMenuClose} />
                <Outlet />
                <Footer />
              </>
            }>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/sarees" element={<ProductsPage />} />
              <Route path="/new-arrivals" element={<ProductsPage />} />
              <Route path="/wedding-sarees" element={<ProductsPage />} />
              <Route path="/heritage-weaves" element={<ProductsPage />} />
              <Route path="/collection" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              <Route path="/order-failed/:orderId" element={<OrderFailedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/our-story" element={<StoryPage />} />
              <Route path="/our-story-and-values" element={<StoryPage />} />
            </Route>

            {/* Admin Routes (No Header/Footer) */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="taxonomy" element={<AdminTaxonomy />} />
              <Route path="occasions" element={<AdminTaxonomy />} />
              <Route path="collections" element={<AdminTaxonomy />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="content" element={<AdminContent />} />
            </Route>
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
