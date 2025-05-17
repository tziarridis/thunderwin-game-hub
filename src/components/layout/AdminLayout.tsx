
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AppHeader from './AppHeader'; // Assuming AppHeader is generic enough or you have an AdminHeader
import { Toaster } from '@/components/ui/sonner';

const AdminLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loader
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check role after confirming user object exists
  if (user && user.role !== 'admin') {
    toast.error("Access Denied: You do not have admin privileges.");
    return <Navigate to="/" replace />; // Redirect non-admins
  }


  return (
    <div className="flex h-screen bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLayout;
