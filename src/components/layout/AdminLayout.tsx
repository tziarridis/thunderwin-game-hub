import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar'; // Ensure this is the correct path
import AdminHeader from '../admin/AdminHeader'; // Ensure this is the correct path
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuth(); // Use isLoading from context
  const location = useLocation();

  const isAdminUser = user?.role === 'admin' || user?.app_metadata?.role === 'admin'; // Check user role

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdminUser) {
    // Optionally, show an "Access Denied" page or redirect to a non-admin area
    // For now, redirecting to home.
    toast.error("Access Denied: You do not have administrative privileges.");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
