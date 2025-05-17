
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AppHeader from './AppHeader'; 
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner'; // Import toast

const AdminLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl">Loading...</div></div>; // Or a proper loader
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
      <AdminSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} /> 
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
