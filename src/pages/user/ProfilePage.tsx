import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import UserLayout from "@/components/layout/UserLayout";
// Check if this Profile import is causing issues based on errors in Profile.tsx (read-only)
import Profile from "@/components/user/Profile"; 
import MobileProfile from "./MobileProfile"; // Assuming MobileProfile is correctly implemented

const ProfilePage = () => {
  const isMobile = useIsMobile();
  
  // console.log('ProfilePage: isMobile', isMobile);
  // console.log('ProfilePage: Rendering UserLayout with Profile or MobileProfile');

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
