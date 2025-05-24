
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import UserLayout from "@/components/layout/UserLayout";
import Profile from "@/components/user/Profile"; 
import MobileProfile from "./MobileProfile";

const ProfilePage = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileProfile />;
  }
  
  return (
    <UserLayout>
      <Profile />
    </UserLayout>
  );
};

export default ProfilePage;
