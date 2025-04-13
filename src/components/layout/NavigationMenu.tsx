import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { 
  Gamepad2, 
  Trophy, 
  Gift, 
  Zap, 
  Crown, 
  LayoutDashboard,
  Table,
  Users,
  Activity,
  CreditCard,
  Dribbble  // Replace Football with Dribbble or another appropriate icon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MenuLink {
  title: string;
  path: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const NavigationMenuDemo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.isAdmin;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const casinoLinks: MenuLink[] = [
    { title: "All Games", path: "/casino", icon: <Gamepad2 className="h-4 w-4 mr-2" /> },
    { title: "Slots", path: "/casino/slots", icon: <Gamepad2 className="h-4 w-4 mr-2" /> },
    { title: "Table Games", path: "/casino/table-games", icon: <Table className="h-4 w-4 mr-2" /> },
    { title: "Live Casino", path: "/casino/live-casino", icon: <Activity className="h-4 w-4 mr-2" /> },
    { title: "Jackpots", path: "/casino/jackpots", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { title: "New Games", path: "/casino/new", icon: <Zap className="h-4 w-4 mr-2" /> },
    { title: "Favorites", path: "/casino/favorites", icon: <Trophy className="h-4 w-4 mr-2" /> },
  ];

  const sportsLinks: MenuLink[] = [
    { title: "All Sports", path: "/sports", icon: <Dribbble className="h-4 w-4 mr-2" /> },
    { title: "Football", path: "/sports/football", icon: <Dribbble className="h-4 w-4 mr-2" /> },
    { title: "Basketball", path: "/sports/basketball", icon: <Activity className="h-4 w-4 mr-2" /> },
    { title: "Tennis", path: "/sports/tennis", icon: <Activity className="h-4 w-4 mr-2" /> },
    { title: "Hockey", path: "/sports/hockey", icon: <Activity className="h-4 w-4 mr-2" /> },
    { title: "Esports", path: "/sports/esports", icon: <Gamepad2 className="h-4 w-4 mr-2" /> },
  ];

  const vipLinks: MenuLink[] = [
    { title: "VIP Program", path: "/vip", icon: <Crown className="h-4 w-4 mr-2" />, highlight: true },
    { title: "Gold Benefits", path: "/vip#gold", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { title: "Platinum Benefits", path: "/vip#platinum", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { title: "Diamond Benefits", path: "/vip#diamond", icon: <Trophy className="h-4 w-4 mr-2" /> },
  ];

  const bonusLinks: MenuLink[] = [
    { title: "All Bonuses", path: "/bonuses", icon: <Zap className="h-4 w-4 mr-2" /> },
    { title: "Welcome Bonus", path: "/bonuses#welcome", icon: <Gift className="h-4 w-4 mr-2" /> },
    { title: "Reload Bonus", path: "/bonuses#reload", icon: <Gift className="h-4 w-4 mr-2" /> },
    { title: "Daily Bonus", path: "/bonuses#daily", icon: <Gift className="h-4 w-4 mr-2" /> },
  ];

  const adminLinks: MenuLink[] = [
    { title: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { title: "Users", path: "/admin/users", icon: <Users className="h-4 w-4 mr-2" /> },
    { title: "VIP Management", path: "/admin/vip-management", icon: <Crown className="h-4 w-4 mr-2" /> },
    { title: "Transactions", path: "/admin/transactions", icon: <CreditCard className="h-4 w-4 mr-2" /> },
  ];

  const promotionsLinks: MenuLink[] = [
    { title: "All Promotions", path: "/promotions", icon: <Gift className="h-4 w-4 mr-2" /> },
    { title: "Welcome Bonus", path: "/bonuses", icon: <Gift className="h-4 w-4 mr-2" /> },
  ];

  return (
    <NavigationMenu className="max-w-none justify-start">
      <NavigationMenuList className="flex space-x-2">
        {/* Casino - Keep as dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className={cn(
              "bg-transparent hover:bg-white/10",
              location.pathname === '/casino' || location.pathname.startsWith('/casino/') ? "text-casino-thunder-green" : ""
            )}
          >
            Casino
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {casinoLinks.map((link) => (
                <li key={link.path}>
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-between rounded-md bg-white/5 p-4 hover:bg-white/10 no-underline outline-none focus:shadow-md transition-colors cursor-pointer"
                      onClick={() => handleNavigation(link.path)}
                    >
                      <div className="flex items-center mb-2">
                        {link.icon}
                        <span className="text-sm font-medium">{link.title}</span>
                      </div>
                    </a>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Sports - Keep as dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className={cn(
              "bg-transparent hover:bg-white/10",
              location.pathname === '/sports' || location.pathname.startsWith('/sports/') ? "text-casino-thunder-green" : ""
            )}
          >
            Sports
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {sportsLinks.map((link) => (
                <li key={link.path}>
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-between rounded-md bg-white/5 p-4 hover:bg-white/10 no-underline outline-none focus:shadow-md transition-colors cursor-pointer"
                      onClick={() => handleNavigation(link.path)}
                    >
                      <div className="flex items-center mb-2">
                        {link.icon}
                        <span className="text-sm font-medium">{link.title}</span>
                      </div>
                    </a>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* VIP - Change to direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10",
                location.pathname === '/vip' ? "text-casino-thunder-green" : ""
              )}
              onClick={() => handleNavigation('/vip')}
            >
              VIP
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Bonuses - Change to direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10",
                location.pathname === '/bonuses' ? "text-casino-thunder-green" : ""
              )}
              onClick={() => handleNavigation('/bonuses')}
            >
              Bonuses
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Promotions - Change to direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10",
                location.pathname === '/promotions' ? "text-casino-thunder-green" : ""
              )}
              onClick={() => handleNavigation('/promotions')}
            >
              Promotions
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {isAuthenticated && isAdmin && (
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className={cn(
                "bg-transparent hover:bg-white/10",
                location.pathname.startsWith('/admin') ? "text-casino-thunder-green" : ""
              )}
            >
              Admin
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                {adminLinks.map((link) => (
                  <li key={link.path}>
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-between rounded-md bg-white/5 p-4 hover:bg-white/10 no-underline outline-none focus:shadow-md transition-colors cursor-pointer"
                        onClick={() => handleNavigation(link.path)}
                      >
                        <div className="flex items-center mb-2">
                          {link.icon}
                          <span className="text-sm font-medium">{link.title}</span>
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationMenuDemo;
