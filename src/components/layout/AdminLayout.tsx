
import { ReactNode, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Redirect to admin login if not authenticated or not an admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className={`flex min-h-screen bg-slate-900 ${collapsed ? 'pl-16' : 'pl-64'}`}>
      <AdminSidebar />
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
