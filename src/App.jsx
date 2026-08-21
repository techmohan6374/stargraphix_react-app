import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DonateModal from './components/ui/DonateModal';
import AiVoiceBot from './components/ui/AiVoiceBot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import Portal from './pages/Portal';
import FreeTools from './pages/FreeTools';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Star Graphix" className="w-16 h-16 object-contain animate-pulse" />
          <p className="text-gray-400 text-sm font-outfit">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

// Layout wrapper for public pages (with header + footer)
function PublicLayout({ children }) {
  const { isAdmin } = useAuth();
  const [donateOpen, setDonateOpen] = useState(false);

  useEffect(() => {
    const handleTrigger = () => setDonateOpen(true);
    window.addEventListener('trigger-donate', handleTrigger);
    return () => window.removeEventListener('trigger-donate', handleTrigger);
  }, []);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 mt-[90px] sm:mt-[108px] md:mt-[120px]">
        {children}
      </div>
      <Footer />
      <DonateModal isOpen={donateOpen} onClose={() => setDonateOpen(false)} />
    </div>
  );
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '500',
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#CC0000', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* Public routes with layout */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/products/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/portal" element={<PublicLayout><Portal /></PublicLayout>} />
        <Route path="/free-tools" element={<PublicLayout><FreeTools /></PublicLayout>} />

        {/* Auth */}
        <Route path="/login" element={<Navigate to="/userlogin" replace />} />
        <Route path="/userlogin" element={<Login mode="user" />} />
        <Route path="/adminlogin" element={<Login mode="admin" />} />

        {/* Protected user routes */}
        <Route path="/wishlist" element={<ProtectedRoute><PublicLayout><Wishlist /></PublicLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><PublicLayout><Checkout /></PublicLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><PublicLayout><Orders /></PublicLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>} />

        {/* Admin routes - no layout (has own sidebar) */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <PublicLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <p className="text-8xl font-black text-primary-600 mb-4">404</p>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
              <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </PublicLayout>
        } />
      </Routes>
      {/* Global AI Voice Bot widget */}
      <AiVoiceBot />
    </>
  );
}
