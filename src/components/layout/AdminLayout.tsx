
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
    
    // Use local storage to persist demo admin state
    const isDemoAdmin = localStorage.getItem('demo-admin') === 'true';
    
    // Small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
      
      console.log("AdminLayout - Auth state after delay:", { 
        isAuthenticated, 
        isAdmin: isAdmin(), 
        user,
        isDemoAdmin,
        path: location.pathname
      });
      
      // If we have a demo admin in localStorage, don't redirect
      if (isDemoAdmin) {
        console.log("AdminLayout - Using demo admin from localStorage");
        return;
      }
      
      // Only redirect if not already on the login page and not authenticated
      if (!isAuthenticated || !isAdmin()) {
        console.log("AdminLayout - Not authenticated or not admin, redirecting to login");
        navigate('/admin/login', { replace: true });
      }
    }, 500); // Longer timeout for better stability
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isAdmin, navigate, user, location.pathname]);
  
  // Show loading while checking authentication
  if (isChecking) {
    return <div className="flex min-h-screen bg-slate-900 items-center justify-center">
      <div className="text-white">Loading admin panel...</div>
    </div>;
  }
  
  // Check for demo admin in localStorage
  const isDemoAdmin = localStorage.getItem('demo-admin') === 'true';
  
  // Only redirect to login if not authenticated or admin AND not demo admin
  if (!isDemoAdmin && (!isAuthenticated || !isAdmin())) {
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
