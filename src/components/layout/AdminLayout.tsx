
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
