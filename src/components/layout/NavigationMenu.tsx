
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { scrollToTop } from "@/utils/scrollUtils";

const NavigationMenuDemo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.isAdmin;

  const handleNavigation = (path: string) => {
    navigate(path);
    scrollToTop();
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <NavigationMenu className="max-w-none justify-start">
      <NavigationMenuList className="flex space-x-2">
        {/* Casino - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2",
                location.pathname === '/casino' || location.pathname.startsWith('/casino/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/casino')}
            >
              <span className="relative overflow-hidden group">
                Casino
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Sports - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2",
                location.pathname === '/sports' || location.pathname.startsWith('/sports/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/sports')}
            >
              <span className="relative overflow-hidden group">
                Sports
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
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

        {/* Help Center - Direct link instead of dropdown */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2",
                location.pathname.startsWith('/support/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/support/help')}
            >
              <span className="relative overflow-hidden group">
                Help Center
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
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
            <NavigationMenuLink asChild>
              <a
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2",
                  location.pathname.startsWith('/admin') 
                    ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                    : "border-transparent"
                )}
                onClick={() => handleNavigation('/admin')}
              >
                <span className="relative overflow-hidden group">
                  Admin
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              </a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationMenuDemo;
