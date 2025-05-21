
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from '../admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Corrected: use app_meta_data and also check user.role directly if populated by Supabase JWT
  const isAdminUser = user?.role === 'admin' || user?.app_meta_data?.role === 'admin';

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
