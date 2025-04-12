
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Redirect to admin login if not authenticated or not an admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-[#1A1F2C]">
      <AdminSidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <div className="p-4 bg-[#222333] border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <main className="p-6 bg-[#1A1F2C]">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
