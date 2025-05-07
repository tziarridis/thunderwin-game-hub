
import { ReactNode, useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children?: ReactNode;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminLayout = ({ children, collapsed, setCollapsed }: AdminLayoutProps) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
      
      console.log("AdminLayout - Auth state:", { 
        isAuthenticated, 
        isAdmin: isAdmin(), 
        user 
      });
      
      if (!isAuthenticated || !isAdmin()) {
        navigate('/admin/login');
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isAdmin, navigate, user]);
  
  // Show loading while checking authentication
  if (isChecking) {
    return <div className="flex min-h-screen bg-slate-900 items-center justify-center">
      <div className="text-white">Loading admin panel...</div>
    </div>;
  }
  
  // Redirect to admin login if not authenticated or not an admin
  if (!isAuthenticated || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className={`flex min-h-screen bg-slate-900 ${collapsed ? 'pl-16' : 'pl-64'}`}>
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 w-full">
        <div className="p-4 bg-slate-800 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <main className="p-6 bg-slate-900">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
