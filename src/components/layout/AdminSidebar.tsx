import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  CreditCard, 
  BarChart2, 
  FileText, 
  ShieldAlert, 
  MessageSquare, 
  Gift, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Share2,
  Star,
  Award,
  Shield,
  LogIn,
  Paintbrush,
  Image,  // Replace ImageIcon
  Gamepad2,  // Replace Casino
  Grid3x3,
  Football,  // Replace FootballIcon
  Globe,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  isActive: boolean;
}

const SidebarLink = ({ to, icon, label, expanded, isActive }: SidebarLinkProps) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 hover:bg-white/5 rounded-md transition-colors ${
      isActive ? 'text-casino-thunder-green bg-white/5' : 'text-white/80 hover:text-casino-thunder-green'
    }`}
  >
    <span className={isActive ? 'text-casino-thunder-green' : 'text-white/60'}>{icon}</span>
    {expanded && <span className="ml-3">{label}</span>}
  </Link>
);

const AdminSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`bg-casino-thunder-darker border-r border-white/5 h-screen fixed top-0 left-0 transition-all duration-300 flex flex-col ${
      expanded ? 'w-64' : 'w-16'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {expanded ? (
          <img 
            src="/file.svg" 
            alt="ThunderWin" 
            className="h-8 thunder-glow"
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center text-casino-thunder-green thunder-glow font-bold text-xl">
            T
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="text-white/60 hover:text-white"
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
      
      <div className="px-3 py-4 flex-grow overflow-y-auto">
        <div className="space-y-1">
          <SidebarLink 
            to="/admin" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            expanded={expanded}
            isActive={isActive("/admin") && location.pathname === "/admin"}
          />
          <SidebarLink 
            to="/admin/users" 
            icon={<Users size={20} />} 
            label="Users" 
            expanded={expanded}
            isActive={isActive("/admin/users")}
          />
          <SidebarLink 
            to="/admin/transactions" 
            icon={<CreditCard size={20} />} 
            label="Transactions" 
            expanded={expanded}
            isActive={isActive("/admin/transactions")}
          />
          <SidebarLink 
            to="/admin/reports" 
            icon={<BarChart2 size={20} />} 
            label="Reports" 
            expanded={expanded}
            isActive={isActive("/admin/reports")}
          />
          <SidebarLink 
            to="/admin/games" 
            icon={<Gift size={20} />} 
            label="Games" 
            expanded={expanded}
            isActive={isActive("/admin/games")}
          />
          
          {/* CMS Section */}
          <SidebarLink 
            to="/admin/cms" 
            icon={<Paintbrush size={20} />} 
            label="CMS" 
            expanded={expanded}
            isActive={isActive("/admin/cms")}
          />
          
          {/* Only show CMS submenu items when expanded */}
          {expanded && isActive("/admin/cms") && (
            <div className="pl-8 mt-1 space-y-1">
              <SidebarLink 
                to="/admin/cms/banners" 
                icon={<Image size={16} />} 
                label="Banners" 
                expanded={expanded}
                isActive={isActive("/admin/cms/banners")}
              />
              <SidebarLink 
                to="/admin/cms/casino" 
                icon={<Gamepad2 size={16} />} 
                label="Casino" 
                expanded={expanded}
                isActive={isActive("/admin/cms/casino")}
              />
              <SidebarLink 
                to="/admin/cms/categories" 
                icon={<Grid3x3 size={16} />} 
                label="Dashboard Categories" 
                expanded={expanded}
                isActive={isActive("/admin/cms/categories")}
              />
              <SidebarLink 
                to="/admin/cms/sportsbook" 
                icon={<Football size={16} />} 
                label="Sportsbook" 
                expanded={expanded}
                isActive={isActive("/admin/cms/sportsbook")}
              />
              <SidebarLink 
                to="/admin/cms/site-data" 
                icon={<Globe size={16} />} 
                label="Site Data" 
                expanded={expanded}
                isActive={isActive("/admin/cms/site-data")}
              />
            </div>
          )}
          
          <SidebarLink 
            to="/admin/promotions" 
            icon={<Gift size={20} />} 
            label="Promotions" 
            expanded={expanded}
            isActive={isActive("/admin/promotions")}
          />
          <SidebarLink 
            to="/admin/affiliates" 
            icon={<Share2 size={20} />} 
            label="Affiliates" 
            expanded={expanded}
            isActive={isActive("/admin/affiliates")}
          />
          <SidebarLink 
            to="/admin/kyc" 
            icon={<Shield size={20} />} 
            label="KYC Management" 
            expanded={expanded}
            isActive={isActive("/admin/kyc")}
          />
          <SidebarLink 
            to="/admin/vip-management" 
            icon={<Star size={20} />} 
            label="VIP & Bonuses" 
            expanded={expanded}
            isActive={isActive("/admin/vip-management")}
          />
          <SidebarLink 
            to="/admin/support" 
            icon={<MessageSquare size={20} />} 
            label="Support" 
            expanded={expanded}
            isActive={isActive("/admin/support")}
          />
        </div>
        
        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="space-y-1">
            <SidebarLink 
              to="/admin/logs" 
              icon={<FileText size={20} />} 
              label="Audit Logs" 
              expanded={expanded}
              isActive={isActive("/admin/logs")}
            />
            <SidebarLink 
              to="/admin/security" 
              icon={<ShieldAlert size={20} />} 
              label="Security" 
              expanded={expanded}
              isActive={isActive("/admin/security")}
            />
            <SidebarLink 
              to="/admin/settings" 
              icon={<Settings size={20} />} 
              label="Settings" 
              expanded={expanded}
              isActive={isActive("/admin/settings")}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-auto border-t border-white/5 p-4">
        {isAuthenticated ? (
          <button 
            className="w-full flex items-center px-3 py-2 text-white/80 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={20} className="text-white/60" />
            {expanded && <span className="ml-3">Logout</span>}
          </button>
        ) : (
          <Link
            to="/admin/login"
            className="w-full flex items-center px-3 py-2 text-white/80 hover:text-casino-thunder-green hover:bg-white/5 rounded-md transition-colors"
          >
            <LogIn size={20} className="text-white/60" />
            {expanded && <span className="ml-3">Admin Login</span>}
          </Link>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
