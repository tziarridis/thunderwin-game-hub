import {
  Gauge,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  MapPin,
  Package2,
  Settings,
  ShoppingBag,
  User,
  Users,
  BarChart3,
  Gift
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  name: string;
  href: string;
}

const sidebarItems: SidebarItemProps[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Bonus Management", href: "/admin/bonus-management", icon: Gift },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Products", href: "/admin/products", icon: Package2 },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Deliveries", href: "/admin/deliveries", icon: MapPin },
  { name: "Tasks", href: "/admin/tasks", icon: ListChecks },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 py-4">
      <div className="space-y-1 py-4">
        <div className="px-3 py-2 text-sm tracking-wide text-zinc-500 uppercase">
          Thunder Admin
        </div>
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-x-2 p-2 text-sm font-semibold rounded-md hover:bg-zinc-800/80
              ${isActive ? "bg-zinc-800 text-sky-500" : "text-zinc-400"}`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
