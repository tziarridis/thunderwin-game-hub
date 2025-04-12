
import { Outlet, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { ExternalLink, Home } from "lucide-react";

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
              alt="ThunderWin" 
              className="h-8 w-auto thunder-glow mr-3"
            />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Home size={16} />
              <span>Main Casino</span>
              <ExternalLink size={14} />
            </Button>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
