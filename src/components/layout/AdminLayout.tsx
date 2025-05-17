
import React, { PropsWithChildren } from 'react'; // Added PropsWithChildren
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AppHeader from './AppHeader'; 
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Define props if AdminLayout itself is to be configured via props by its parent
// interface AdminLayoutProps {
//   // exampleProp?: string;
// }

// Use PropsWithChildren if AdminLayout is meant to wrap children directly,
// though with Outlet, it's usually not needed for the main content.
const AdminLayout: React.FC<PropsWithChildren<{}>> = ({ children }) => { // Added PropsWithChildren for flexibility, though Outlet is primary
  const { user, loading, isAuthenticated, isAdmin } = useAuth(); // Added isAdmin
  const [collapsed, setCollapsed] = React.useState(false);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl">Loading...</div></div>;
  }

  if (!isAuthenticated) {
    // For admin section, typically redirect to an admin-specific login or a general login
    return <Navigate to="/admin/login" replace />; 
  }
  
  if (!isAdmin && user?.role !== 'admin') { // Check isAdmin from context or user.role
    toast.error("Access Denied: You do not have admin privileges.");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <AdminSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} /> 
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}{/* Render children if passed, otherwise Outlet */}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLayout;

