
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavBar from "@/components/layout/MobileNavBar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-casino-thunder-darker">
      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4 py-8 pt-20">
          {children}
        </div>
        {isMobile && <MobileNavBar onOpenMenu={() => {}} />}
      </ScrollArea>
    </div>
  );
};

export default UserLayout;
