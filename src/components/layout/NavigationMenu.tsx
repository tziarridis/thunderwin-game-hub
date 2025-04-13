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
  Dribbble,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { scrollToTop } from "@/utils/scrollUtils";

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
    scrollToTop();
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

  const adminLinks: MenuLink[] = [
    { title: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { title: "Users", path: "/admin/users", icon: <Users className="h-4 w-4 mr-2" /> },
    { title: "VIP Management", path: "/admin/vip-management", icon: <Crown className="h-4 w-4 mr-2" /> },
    { title: "Transactions", path: "/admin/transactions", icon: <CreditCard className="h-4 w-4 mr-2" /> },
  ];

  const helpCenterLinks: MenuLink[] = [
    { title: "Help Center", path: "/support/help", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    { title: "FAQs", path: "/support/faq", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    { title: "Contact Support", path: "/support/contact", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    { title: "Responsible Gaming", path: "/support/responsible-gaming", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
  ];

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <NavigationMenu className="max-w-none justify-start">
      <NavigationMenuList className="flex space-x-2">
        {/* Casino - Keep as dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className={cn(
              "bg-transparent hover:bg-white/10 transition-all duration-300",
              location.pathname === '/casino' || location.pathname.startsWith('/casino/') 
                ? "text-casino-thunder-green shadow-neon" 
                : ""
            )}
          >
            Casino
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-casino-deep-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg">
              {casinoLinks.map((link, index) => (
                <motion.li 
                  key={link.path}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-between rounded-md bg-white/5 p-4 hover:bg-white/10 hover:shadow-neon no-underline outline-none focus:shadow-md transition-all duration-300 cursor-pointer group"
                      onClick={() => handleNavigation(link.path)}
                    >
                      <div className="flex items-center mb-2 group-hover:text-casino-thunder-green transition-colors">
                        {link.icon}
                        <span className="text-sm font-medium">{link.title}</span>
                      </div>
                    </a>
                  </NavigationMenuLink>
                </motion.li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Sports - Keep as dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className={cn(
              "bg-transparent hover:bg-white/10 transition-all duration-300",
              location.pathname === '/sports' || location.pathname.startsWith('/sports/') 
                ? "text-casino-thunder-green shadow-neon" 
                : ""
            )}
          >
            Sports
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-casino-deep-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg">
              {sportsLinks.map((link, index) => (
                <motion.li 
                  key={link.path}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-between rounded-md bg-white/5 p-4 hover:bg-white/10 hover:shadow-neon no-underline outline-none focus:shadow-md transition-all duration-300 cursor-pointer group"
                      onClick={() => handleNavigation(link.path)}
                    >
                      <div className="flex items-center mb-2 group-hover:text-casino-thunder-green transition-colors">
                        {link.icon}
                        <span className="text-sm font-medium">{link.title}</span>
                      </div>
                    </a>
                  </NavigationMenuLink>
                </motion.li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* VIP - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2",
                location.pathname === '/vip' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/vip')}
            >
              <span className="relative overflow-hidden group">
                VIP
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Help Center - New section */}
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className={cn(
              "bg-transparent hover:bg-white/10 transition-all duration-300",
              location.pathname.startsWith('/support/') 
                ? "text-casino-thunder-green shadow-neon" 
                : ""
            )}
          >
            Help Center
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-casino-deep-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg">
              {helpCenterLinks.map((link, index) => (
                <motion.li 
                  key={link.path}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-between rounded-md bg-white/5 p-4 hover:bg-white/10 hover:shadow-neon no-underline outline-none focus:shadow-md transition-all duration-300 cursor-pointer group"
                      onClick={() => handleNavigation(link.path)}
                    >
                      <div className="flex items-center mb-2 group-hover:text-casino-thunder-green transition-colors">
                        {link.icon}
                        <span className="text-sm font-medium">{link.title}</span>
                      </div>
                    </a>
                  </NavigationMenuLink>
                </motion.li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Promotions - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2",
                location.pathname === '/promotions' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/promotions')}
            >
              <span className="relative overflow-hidden group">
                Promotions
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Bonuses - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2",
                location.pathname === '/bonuses' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/bonuses')}
            >
              <span className="relative overflow-hidden group">
                Bonuses
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Admin section - Only for admins */}
        {isAuthenticated && isAdmin && (
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className={cn(
                "bg-transparent hover:bg-white/10 transition-all duration-300",
                location.pathname.startsWith('/admin') 
                  ? "text-casino-thunder-green shadow-neon" 
                  : ""
              )}
            >
              Admin
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-casino-deep-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg">
                {adminLinks.map((link, index) => (
                  <motion.li 
                    key={link.path}
                    initial="hidden"
                    animate="visible"
                    variants={menuItemVariants}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-between rounded-md bg-white/5 p-4 hover:bg-white/10 hover:shadow-neon no-underline outline-none focus:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => handleNavigation(link.path)}
                      >
                        <div className="flex items-center mb-2 group-hover:text-casino-thunder-green transition-colors">
                          {link.icon}
                          <span className="text-sm font-medium">{link.title}</span>
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </motion.li>
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
