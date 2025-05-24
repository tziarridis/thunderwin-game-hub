
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavBar from "@/components/layout/MobileNavBar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

interface UserLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  hideMobileNav?: boolean;
  className?: string;
}

const UserLayout = ({ 
  children, 
  fullWidth = false, 
  hideMobileNav = false,
  className 
}: UserLayoutProps) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-casino-thunder-darker">
      <ScrollArea className="h-screen pb-16">
        <div className={`pt-20 pb-24 ${className || ''}`}>
          {fullWidth ? (
            children
          ) : (
            <ResponsiveContainer>
              {children}
            </ResponsiveContainer>
          )}
        </div>
        {isMobile && !hideMobileNav && (
          <MobileTabBar onOpenMenu={() => setMobileMenuOpen(true)} />
        )}
      </ScrollArea>
      
      {/* Mobile menu would be here */}
    </div>
  );
};

export default UserLayout;
