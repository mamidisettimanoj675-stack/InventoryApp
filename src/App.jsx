import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { CartProvider, useCart } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import MetricsPage from './pages/MetricsPage';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/dashboard.css';

// Header component that uses auth context
function AppHeader({ searchTerm, setSearchTerm }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div className="header-brand">
          <div className="brand-mark">i</div>
          <div className="brand-label">
            <strong>InventoryApp</strong>
            <span>Manage Smartly</span>
          </div>
        </div>

        <div className="header-search">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            aria-label="Search products, brands and more"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" aria-label="Search">
            🔍
          </button>
        </div>

        <div className="header-actions">
          {isAuthenticated && user ? (
            <>
              <nav className="route-nav">
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  aria-label="Dashboard"
                >
                  Dashboard
                </NavLink>
                {['staff', 'manager'].includes(user.role) && (
                  <NavLink
                    to="/items"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    aria-label="Items"
                  >
                    Items
                  </NavLink>
                )}
                {user.role === 'manager' && (
                  <NavLink
                    to="/metrics"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    aria-label="Metrics"
                  >
                    Metrics
                  </NavLink>
                )}
                {user.role === 'user' && (
                  <NavLink
                    to="/cart"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    aria-label="Shopping Cart"
                  >
                    🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </NavLink>
                )}
              </nav>
              <button className="btn btn-secondary btn-logout" onClick={logout} aria-label="Logout">
                Logout
              </button>
            </>
          ) : (
            <div className="auth-actions">
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'active' : 'header-action-link')}
                aria-label="Login"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) => (isActive ? 'active' : 'header-action-link')}
                aria-label="Sign up"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}

// Main app routes
function AppRoutes({ searchTerm, setSearchTerm }) {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Signup />
        }
      />

      {/* Protected routes */}
      <Route path="/" element={<DashboardPage searchTerm={searchTerm} setSearchTerm={setSearchTerm} />} />
      <Route
        path="/items"
        element={
          <ProtectedRoute requiredRoles={['staff', 'manager']}>
            <ItemsPage searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/metrics"
        element={
          <ProtectedRoute requiredRoles={['manager']}>
            <MetricsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute requiredRoles={['user']}>
            <Cart />
          </ProtectedRoute>
        }
      />

      {/* 404 route */}
      <Route
        path="*"
        element={
          <div className="page-container">
            <h1>404 - Page Not Found</h1>
            <p>
              The page you are looking for doesn't exist.{' '}
              <NavLink to="/">Go back to dashboard</NavLink>
            </p>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <InventoryProvider>
            <CartProvider>
              <div className="app-container">
                <AppHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <main className="app-main">
                  <AppRoutes searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </main>
              </div>
            </CartProvider>
          </InventoryProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
