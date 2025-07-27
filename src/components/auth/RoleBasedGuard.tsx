import React from 'react';
import { useAuthStore } from '@/lib/auth/auth-store';
import { Navigate } from 'react-router-dom';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode | null;
}

/**
 * Component that restricts access based on user roles
 */
export const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({ 
  children, 
  allowedRoles,
  fallback = null
}) => {
  const { isAuthenticated, hasAnyRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasPermission = hasAnyRole(allowedRoles);

  if (!hasPermission) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};