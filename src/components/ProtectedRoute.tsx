import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

const FullPageSpinner: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  // useEffect is not needed here — auth is resolved via AuthContext on mount
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
