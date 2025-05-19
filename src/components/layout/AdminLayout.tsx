
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader'; // Make sure this path is correct
import AdminSidebar from './AdminSidebar'; // Make sure this path is correct
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const AdminLayout: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Redirect to login or home page if not authenticated or not an admin
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader /> {/* Removed user prop */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLayout;

