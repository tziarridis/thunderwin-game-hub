import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar'; // Corrected import path
import AdminHeader from '@/components/admin/AdminHeader';   // Corrected import path
import { useAuth } from '@/contexts/AuthContext'; // For user info

const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading admin area...</div>; // Or a proper loader
  }

  // Basic check, can be expanded with roles if needed
  // This should ideally be handled by route protection as well
  if (!isAdmin && !loading) { 
    // Redirect or show an unauthorized message
    // For now, just a message. Consider navigating to /admin/login or /
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <p className="text-2xl font-semibold text-red-500">Access Denied</p>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            {/* Link to go home or login? */}
        </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} /> 
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
