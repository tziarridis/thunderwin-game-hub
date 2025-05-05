
import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Users2,
  Gift,
  Award,
  FileCheck2,
  BarChart2,
  ListX,
  HelpCircle,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  CircleDot,
  LogOut,
  TestTube,
  History,
  Package,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
  isSubmenu?: boolean;
}

interface MenuGroupProps {
  icon: React.ReactNode;
  title: string;
  collapsed: boolean;
  active: boolean;
  children: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  collapsed,
  active,
  onClick,
  isSubmenu,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/10",
        active ? "bg-white/5 text-white" : "text-white/60 hover:text-white",
        isSubmenu ? "pl-8" : ""
      )}
    >
      {icon}
      {!collapsed && <span>{title}</span>}
    </button>
  );
};

const MenuGroup: React.FC<MenuGroupProps> = ({
  icon,
  title,
  collapsed,
  active,
  children,
}) => {
  const [open, setOpen] = useState(active);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "group relative flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/10",
          active ? "bg-white/5 text-white" : "text-white/60 hover:text-white"
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          {!collapsed && <span>{title}</span>}
        </div>
        {!collapsed && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open ? "rotate-90" : ""
            )}
          />
        )}
      </button>
      {open && <div className="flex flex-col pl-2">{children}</div>}
    </div>
  );
};

const AdminSidebar = ({ collapsed, setCollapsed }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = location.pathname;
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-casino-thunder-dark transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col justify-between overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Captain</span>
              <span className="text-xl font-bold text-casino-thunder-green">Admin</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1 hover:bg-white/10"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-white" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
        
        {/* Menu */}
        <nav className="flex flex-col gap-1 px-2 py-4">
          {/* Dashboard */}
          <MenuItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Dashboard"
            collapsed={collapsed}
            active={pathname === "/admin" || pathname === "/admin/dashboard"}
            onClick={() => navigate("/admin/dashboard")}
          />
          
          {/* Users */}
          <MenuItem
            icon={<Users className="h-5 w-5" />}
            title="Users"
            collapsed={collapsed}
            active={pathname === "/admin/users"}
            onClick={() => navigate("/admin/users")}
          />
          
          {/* Games - Reorganized Section */}
          <MenuGroup
            icon={<Gamepad2 className="h-5 w-5" />}
            title="Games"
            collapsed={collapsed}
            active={pathname.includes("/admin/game") || pathname.includes("/admin/aggregator") || pathname.includes("/admin/pp-")}
          >
            {/* Game Management */}
            <MenuItem
              icon={<Package className="h-4 w-4" />}
              title="Game Management"
              collapsed={collapsed}
              active={pathname === "/admin/game-management"}
              onClick={() => navigate("/admin/game-management")}
              isSubmenu
            />
            
            {/* Game Aggregators section */}
            <MenuGroup
              icon={<Settings2 className="h-4 w-4" />}
              title="Aggregator Settings"
              collapsed={collapsed}
              active={pathname.includes("/admin/aggregator")}
            >
              <MenuItem
                icon={<CircleDot className="h-4 w-4" />}
                title="Game Aggregator"
                collapsed={collapsed}
                active={pathname === "/admin/game-aggregator"}
                onClick={() => navigate("/admin/game-aggregator")}
                isSubmenu
              />
              <MenuItem
                icon={<CircleDot className="h-4 w-4" />}
                title="Settings"
                collapsed={collapsed}
                active={pathname === "/admin/aggregator-settings" || pathname === "/admin/casino-aggregator-settings"}
                onClick={() => navigate("/admin/aggregator-settings")}
                isSubmenu
              />
            </MenuGroup>
            
            {/* Integrations section */}
            <MenuGroup
              icon={<TestTube className="h-4 w-4" />}
              title="Integrations"
              collapsed={collapsed}
              active={pathname.includes("/admin/pp-")}
            >
              <MenuItem
                icon={<CircleDot className="h-4 w-4" />}
                title="PP Integration Tester"
                collapsed={collapsed}
                active={pathname === "/admin/pp-integration-tester"}
                onClick={() => navigate("/admin/pp-integration-tester")}
                isSubmenu
              />
              <MenuItem
                icon={<History className="h-4 w-4" />}
                title="PP Transactions"
                collapsed={collapsed}
                active={pathname === "/admin/pp-transactions"}
                onClick={() => navigate("/admin/pp-transactions")}
                isSubmenu
              />
            </MenuGroup>
          </MenuGroup>
          
          {/* Transactions */}
          <MenuItem
            icon={<Wallet className="h-5 w-5" />}
            title="Transactions"
            collapsed={collapsed}
            active={pathname === "/admin/transactions"}
            onClick={() => navigate("/admin/transactions")}
          />
          
          {/* Affiliates */}
          <MenuItem
            icon={<Users2 className="h-5 w-5" />}
            title="Affiliates"
            collapsed={collapsed}
            active={pathname === "/admin/affiliates"}
            onClick={() => navigate("/admin/affiliates")}
          />
          
          {/* Promotions */}
          <MenuItem
            icon={<Gift className="h-5 w-5" />}
            title="Promotions"
            collapsed={collapsed}
            active={pathname === "/admin/promotions"}
            onClick={() => navigate("/admin/promotions")}
          />
          
          {/* VIP & Bonuses */}
          <MenuItem
            icon={<Award className="h-5 w-5" />}
            title="VIP & Bonuses"
            collapsed={collapsed}
            active={pathname === "/admin/vip-bonus"}
            onClick={() => navigate("/admin/vip-bonus")}
          />
          
          {/* KYC Management */}
          <MenuItem
            icon={<FileCheck2 className="h-5 w-5" />}
            title="KYC Management"
            collapsed={collapsed}
            active={pathname === "/admin/kyc"}
            onClick={() => navigate("/admin/kyc")}
          />
          
          {/* Reports */}
          <MenuItem
            icon={<BarChart2 className="h-5 w-5" />}
            title="Reports"
            collapsed={collapsed}
            active={pathname === "/admin/reports"}
            onClick={() => navigate("/admin/reports")}
          />
          
          {/* Logs */}
          <MenuItem
            icon={<ListX className="h-5 w-5" />}
            title="Logs"
            collapsed={collapsed}
            active={pathname === "/admin/logs"}
            onClick={() => navigate("/admin/logs")}
          />
          
          {/* Support */}
          <MenuItem
            icon={<HelpCircle className="h-5 w-5" />}
            title="Support"
            collapsed={collapsed}
            active={pathname === "/admin/support"}
            onClick={() => navigate("/admin/support")}
          />
          
          {/* Security */}
          <MenuItem
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Security"
            collapsed={collapsed}
            active={pathname === "/admin/security"}
            onClick={() => navigate("/admin/security")}
          />
          
          {/* Settings */}
          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            title="Settings"
            collapsed={collapsed}
            active={pathname === "/admin/settings"}
            onClick={() => navigate("/admin/settings")}
          />
        </nav>
        
        {/* User Profile */}
        <div className="mt-auto border-t border-white/10 p-4">
          {isAuthenticated && user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-white">{user.name?.charAt(0) || "A"}</span>
                  )}
                </div>
                {!collapsed && (
                  <div>
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-white/60">{user.email}</div>
                  </div>
                )}
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 mt-2 px-3 py-2 rounded-md text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>
          ) : (
            <div className="text-center text-white/60">Not authenticated</div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
