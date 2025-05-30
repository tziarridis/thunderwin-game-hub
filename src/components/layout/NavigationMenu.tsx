
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
import { scrollToTop } from "@/utils/scrollUtils";
import { Gamepad2, Trophy, Gift, HelpCircle, Zap, Heart, Users, Crown } from "lucide-react";

const NavigationMenuDemo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.isAdmin;

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
    scrollToTop();
  };

  return (
    <NavigationMenu className="max-w-none justify-start">
      <NavigationMenuList className="flex space-x-4 overflow-x-auto pb-2">
        {/* Casino - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/casino' || location.pathname.startsWith('/casino/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/casino')}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Casino
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Live Casino - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/casino/live-casino'
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/casino/live-casino')}
            >
              <Users className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Live Casino
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Sports - New placement (third) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/sports' || location.pathname.startsWith('/sports/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/sports')}
            >
              <Trophy className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Sports
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Favorites - Direct link (now fourth) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/casino/favorites'
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/casino/favorites')}
            >
              <Heart className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Favorites
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
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/vip'
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/vip')}
            >
              <Crown className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                VIP
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
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/promotions' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/promotions')}
            >
              <Gift className="mr-2 h-4 w-4" />
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
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/bonuses' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/bonuses')}
            >
              <Zap className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Bonuses
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Help Center - Direct link (moved to last position) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname.startsWith('/support/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleNavigation('/support/help')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Help Center
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
                  "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
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
