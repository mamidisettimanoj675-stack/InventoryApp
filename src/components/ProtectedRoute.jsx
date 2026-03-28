import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../services/authService';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRoles && !hasRole(user.role, requiredRoles)) {
    return (
      <div className="page-container" role="alert">
        <div className="error-message" style={{ marginTop: '2rem' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page. Required roles: {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</p>
          <p>Your current role: <strong>{user.role}</strong></p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
