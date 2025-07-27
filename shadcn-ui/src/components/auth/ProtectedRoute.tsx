import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth/auth-store';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

/**
 * A wrapper for routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles = [],
  children 
}) => {
  const { isAuthenticated, hasAnyRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check if user has any of those roles
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If children are provided, render them
  // Otherwise render the Outlet (for Routes that use this as a parent route)
  return <>{children ? children : <Outlet />}</>;
};