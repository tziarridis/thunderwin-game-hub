
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminProtectedProps {
  children: React.ReactNode;
}

export const AdminProtected = ({ children }: AdminProtectedProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
