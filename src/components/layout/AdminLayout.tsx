
import { ReactNode, useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Prevent redirection loops by checking current path
    const isLoginPage = location.pathname === '/admin/login';
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }
    
    console.log("AdminLayout - Initial auth state:", { 
      isAuthenticated, 
      isAdmin: isAdmin(), 
      user,
      path: location.pathname
    });
    
    // Small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
      
      console.log("AdminLayout - Auth state after delay:", { 
        isAuthenticated, 
        isAdmin: isAdmin(), 
        user,
        path: location.pathname
      });
      
      // Only redirect if not already on the login page
      if (!isAuthenticated || !isAdmin()) {
        console.log("AdminLayout - Not authenticated or not admin, redirecting to login");
        navigate('/admin/login');
      }
    }, 300); // Shorter timeout for better responsiveness
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isAdmin, navigate, user, location.pathname]);
  
  // Show loading while checking authentication
  if (isChecking) {
    return <div className="flex min-h-screen bg-slate-900 items-center justify-center">
      <div className="text-white">Loading admin panel...</div>
    </div>;
  }
  
  // Redirect to admin login if not authenticated or not an admin
  if (!isAuthenticated || !isAdmin()) {
    console.log("AdminLayout - Redirecting to login due to auth check");
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
