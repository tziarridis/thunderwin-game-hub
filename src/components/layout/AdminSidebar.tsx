
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  BarChart3,
  Gamepad2,
  Ticket,
  Gift,
  FileText,
  LifeBuoy,
  MessageSquareQuoteIcon,
  Briefcase,
  DollarSign,
  Landmark,
  Palette,
  Database,
  TerminalSquare,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Using components from @/components/ui/sidebar directly instead of importing from sidebar module
interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapsedChange, className, children }) => {
  return (
    <div className={cn("border-r border-border bg-card h-screen flex flex-col", 
      collapsed ? "w-16" : "w-64", className)}>
      {children}
    </div>
  );
};

const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex h-14 items-center border-b border-border px-4", className)} {...props} />
);

const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex-1", className)} {...props} />
);

const SidebarFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("border-t border-border p-2", className)} {...props} />
);

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed = false, onCollapsedChange }) => {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Handle collapse state changes
  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, current: pathname === '/admin/dashboard' },
    { href: "/admin/users", label: "Users", icon: Users, current: pathname.startsWith('/admin/users') },
    { href: "/admin/games", label: "Games", icon: Gamepad2, current: pathname.startsWith('/admin/games') },
    { href: "/admin/transactions", label: "Transactions", icon: DollarSign, current: pathname.startsWith('/admin/transactions') },
    { href: "/admin/promotions", label: "Promotions", icon: Gift, current: pathname.startsWith('/admin/promotions') },
    { href: "/admin/affiliates", label: "Affiliates", icon: Briefcase, current: pathname.startsWith('/admin/affiliates') },
    { href: "/admin/kyc", label: "KYC Verification", icon: ShieldCheck, current: pathname.startsWith('/admin/kyc') },
    { href: "/admin/reports", label: "Reports", icon: BarChart3, current: pathname.startsWith('/admin/reports') },
    { href: "/admin/support", label: "Support Tickets", icon: MessageSquareQuoteIcon, current: pathname.startsWith('/admin/support') },
    { href: "/admin/cms", label: "CMS", icon: Landmark, current: pathname.startsWith('/admin/cms') },
    { href: "/admin/settings", label: "Settings", icon: Settings, current: pathname.startsWith('/admin/settings') },
    { href: "/admin/logs", label: "System Logs", icon: TerminalSquare, current: pathname.startsWith('/admin/logs') },
    { href: "/admin/integrations", label: "Integrations", icon: Network, current: pathname.startsWith('/admin/integrations') },
  ];

  return (
    <Sidebar collapsed={isCollapsed} className="border-r border-border bg-card">
      <SidebarHeader className="flex h-14 items-center border-b border-border px-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary" />
          {!isCollapsed && <span className="text-lg font-semibold">Admin</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="px-2 py-2">
            <nav className="grid gap-1">
              {navItems.map((item, index) => (
                <Button
                  key={index}
                  asChild
                  variant={item.current ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start",
                    isCollapsed ? "px-2" : "px-3"
                  )}
                >
                  <Link to={item.href}>
                    <item.icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={toggleCollapsed}
        >
          <LayoutDashboard className="h-4 w-4 rotate-90" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
