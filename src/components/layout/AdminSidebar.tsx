
import { Link } from "react-router-dom";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
}

const SidebarLink = ({ to, icon, label, expanded }: SidebarLinkProps) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 text-white/80 hover:text-casino-thunder-green hover:bg-white/5 rounded-md transition-colors"
  >
    <span className="text-white/60">{icon}</span>
    {expanded && <span className="ml-3">{label}</span>}
  </Link>
);

const AdminSidebar = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`bg-casino-thunder-darker border-r border-white/5 h-screen fixed top-0 left-0 transition-all duration-300 ${
      expanded ? 'w-64' : 'w-16'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {expanded ? (
          <img 
            src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
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
      
      <div className="px-3 py-4">
        <div className="space-y-1">
          <SidebarLink 
            to="/admin" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            expanded={expanded}
          />
          <SidebarLink 
            to="/admin/users" 
            icon={<Users size={20} />} 
            label="Users" 
            expanded={expanded}
          />
          <SidebarLink 
            to="/admin/transactions" 
            icon={<CreditCard size={20} />} 
            label="Transactions" 
            expanded={expanded}
          />
          <SidebarLink 
            to="/admin/reports" 
            icon={<BarChart2 size={20} />} 
            label="Reports" 
            expanded={expanded}
          />
          <SidebarLink 
            to="/admin/games" 
            icon={<Gift size={20} />} 
            label="Games & Promos" 
            expanded={expanded}
          />
          <SidebarLink 
            to="/admin/support" 
            icon={<MessageSquare size={20} />} 
            label="Support" 
            expanded={expanded}
          />
        </div>
        
        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="space-y-1">
            <SidebarLink 
              to="/admin/logs" 
              icon={<FileText size={20} />} 
              label="Audit Logs" 
              expanded={expanded}
            />
            <SidebarLink 
              to="/admin/security" 
              icon={<ShieldAlert size={20} />} 
              label="Security" 
              expanded={expanded}
            />
            <SidebarLink 
              to="/admin/settings" 
              icon={<Settings size={20} />} 
              label="Settings" 
              expanded={expanded}
            />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
        <button className="flex items-center px-3 py-2 text-white/80 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors w-full">
          <LogOut size={20} className="text-white/60" />
          {expanded && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
