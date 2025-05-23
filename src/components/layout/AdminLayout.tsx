
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar'; // Assuming AdminSidebar is correctly implemented
import AdminHeader from '../admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminLayout = () => {
  const { isAuthenticated, user, isLoading, isAdmin } = useAuth(); // Use isLoading and isAdmin
  const location = useLocation();

  // isAdmin check is now directly from useAuth
  // const isAdminUser = user?.role === 'admin' || user?.app_metadata?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error("Authentication required. Redirecting to login.");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) { // Use isAdmin from context
    toast.error("Access Denied: You do not have administrative privileges.");
    return <Navigate to="/" replace />; // Redirect to home or a general access denied page
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
