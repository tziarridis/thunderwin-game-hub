import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, Users, Settings, ShoppingCart, BarChart3, ShieldCheck, Gem, Gamepad2, LogOut, Tv2, Newspaper, DollarSign, Briefcase, HandCoins, PercentCircle, FileText, MessageSquareQuestion, Headset, Palette, LifeBuoy, Rocket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Game Management', href: '/admin/games', icon: Gamepad2 },
  { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
  { name: 'Affiliate System', href: '/admin/affiliates', icon: Briefcase },
  { name: 'Bonuses & VIP', href: '/admin/vip-bonus', icon: Gem },
  { name: 'Promotions', href: '/admin/promotions', icon: PercentCircle },
  { name: 'KYC Management', href: '/admin/kyc', icon: ShieldCheck },
  { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
  { name: 'CMS', items: [
      { name: 'Overview', href: '/admin/cms', icon: Palette },
      { name: 'Site Data', href: '/admin/cms/sitedata', icon: Newspaper },
      { name: 'Banners', href: '/admin/cms/banners', icon: Tv2 },
      { name: 'Games Mgmt (CMS)', href: '/admin/cms/games', icon: Gamepad2 },
      { name: 'Categories', href: '/admin/cms/categories', icon: Palette},
      // { name: 'Casino Page', href: '/admin/cms/casino', icon: Gem },
      // { name: 'Sportsbook Page', href: '/admin/cms/sportsbook', icon: Rocket },
    ]
  },
  { name: 'Casino Aggregator', href: '/admin/casino-aggregator', icon: HandCoins},
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Support Tickets', href: '/admin/support', icon: Headset },
  // { name: 'System Logs', href: '/admin/logs', icon: FileText },
  // { name: 'Deployment Checklist', href: '/admin/deployment-checklist', icon: LifeBuoy },

  // PP Specific - can be hidden if not relevant
  // { name: 'PP Integration Tester', href: '/admin/pp-tester', icon: Settings },
  // { name: 'PP Transactions', href: '/admin/pp-transactions', icon: DollarSign },
];

const secondaryNavItems = [
    // { name: 'API Docs', href: '#', icon: FileText },
    // { name: 'FAQ', href: '#', icon: MessageSquareQuestion },
];


const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const UserNav = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start text-left px-2">
           <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user?.avatar || undefined} alt={user?.displayName || user?.username || ""} />
            <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  const renderNavItem = (item: any, index: number) => {
    if (item.items) { // It's a group with sub-items
      // Check if any sub-item is active to highlight the group
      const isGroupActive = item.items.some((subItem: any) => location.pathname.startsWith(subItem.href));
      return (
        <div key={index} className="px-3 py-2">
          <h2 className={`mb-2 px-4 text-lg font-semibold tracking-tight ${isGroupActive ? 'text-casino- почти-white' : 'text-muted-foreground'}`}>
            {item.name || 'CMS Tools'} 
          </h2>
          <div className="space-y-1">
            {item.items.map((subItem: any, subIndex: number) => (
              <Button
                key={`${index}-${subIndex}`}
                variant={location.pathname.startsWith(subItem.href) ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link to={subItem.href}>
                  <subItem.icon className="mr-2 h-4 w-4" />
                  {subItem.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      );
    } else { // It's a single nav item
      return (
        <Button
          key={index}
          variant={location.pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          asChild
        >
          <Link to={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        </Button>
      );
    }
  };


  return (
    <div className="hidden lg:block border-r bg-card text-card-foreground w-72">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex items-center border-b px-4 py-3 h-[60px]">
           {/* Replace with your logo or app name */}
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <Rocket className="h-6 w-6 text-casino-thunder-green" />
            <span className="text-lg">Casino Admin</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-muted-foreground">
              Main Menu
            </h2>
            <div className="space-y-1">
              {adminNavItems.filter(item => !item.items).map(renderNavItem)}
            </div>
          </div>
          {/* Render CMS grouped items */}
          {adminNavItems.filter(item => item.items && item.name === 'CMS').map(renderNavItem)}

        </ScrollArea>

        <div className="mt-auto p-4 border-t">
          {user ? <UserNav /> : <Button className="w-full" onClick={() => navigate('/admin/login')}>Login</Button>}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
