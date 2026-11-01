/*
 * ProtectedRoute — redirects unauthenticated users to /login
 * Preserves the intended destination in ?return= query param.
 * Shows LoadingState while checking the session.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState fullPage message="Checking your session..." />;
  if (!session) {
    return <Navigate to={`/login?return=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}
