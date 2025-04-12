
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <div className="p-4 bg-gray-900 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
