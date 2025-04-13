
import React, { useEffect, useState } from "react";
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
import { navigateByButtonName } from "@/utils/navigationUtils";
import { Gamepad2, Trophy, Gift, HelpCircle, Zap, Flame, Crown } from "lucide-react";

const NavigationMenuDemo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.isAdmin;
  const [showSportsSection, setShowSportsSection] = useState(true);

  useEffect(() => {
    // Check if sports section should be hidden from localStorage
    const interfaceSettings = localStorage.getItem("backoffice_interface_settings");
    if (interfaceSettings) {
      try {
        const settings = JSON.parse(interfaceSettings);
        setShowSportsSection(settings.showSportsSection !== false); // Default to true if not explicitly false
      } catch (error) {
        console.error("Error parsing interface settings:", error);
      }
    }
  }, []);

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
    scrollToTop();
  };
  
  const handleTextNavigation = (text: string) => {
    navigateByButtonName(text, navigate);
    scrollToTop();
  };

  return (
    <NavigationMenu className="max-w-none justify-start">
      <NavigationMenuList className="flex space-x-4 overflow-x-auto pb-2">
        {/* Casino - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/casino' || location.pathname.startsWith('/casino/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleTextNavigation('Casino')}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Casino
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Slots - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/casino/slots'
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleTextNavigation('Slots')}
            >
              <Flame className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Slots
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Live Casino - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/casino/live-casino'
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleTextNavigation('Live Casino')}
            >
              <Zap className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Live Casino
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Sports - Direct link (conditionally rendered) */}
        {showSportsSection && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <button
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                  location.pathname === '/sports' || location.pathname.startsWith('/sports/') 
                    ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                    : "border-transparent"
                )}
                onClick={() => handleTextNavigation('Sports')}
              >
                <Trophy className="mr-2 h-4 w-4" />
                <span className="relative overflow-hidden group">
                  Sports
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              </button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}

        {/* Promotions - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/promotions' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleTextNavigation('Promotions')}
            >
              <Gift className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Promotions
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* VIP - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/vip' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleTextNavigation('VIP')}
            >
              <Crown className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                VIP
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Bonuses - Direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname === '/bonuses' 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleTextNavigation('Bonuses')}
            >
              <Zap className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Bonuses
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Help Center - Direct link (moved to last position) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                location.pathname.startsWith('/support/') 
                  ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                  : "border-transparent"
              )}
              onClick={() => handleTextNavigation('Help Center')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span className="relative overflow-hidden group">
                Help Center
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Admin section - Only for admins */}
        {isAuthenticated && isAdmin && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <button
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-white/10 transition-all duration-300 border-b-2 flex items-center",
                  location.pathname.startsWith('/admin') 
                    ? "text-casino-thunder-green shadow-neon border-casino-thunder-green" 
                    : "border-transparent"
                )}
                onClick={() => handleTextNavigation('Admin')}
              >
                <span className="relative overflow-hidden group">
                  Admin
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              </button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationMenuDemo;
