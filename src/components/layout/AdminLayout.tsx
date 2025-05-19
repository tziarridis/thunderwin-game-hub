
import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children?: ReactNode; // Allow children prop for direct nesting if needed
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) { // Check isAdmin status
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/auth/login" replace />; // Or a specific "unauthorized" page
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children || <Outlet />} {/* Render children or Outlet */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
