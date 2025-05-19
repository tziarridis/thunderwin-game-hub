
import React from 'react';
import UserLayout from '@/components/layout/UserLayout';
import ProfileDetails from '@/components/user/Profile'; // Renamed import to avoid conflict
// Removed ProfilePage import, it was causing issues. Profile.tsx is the main page content.

const ProfilePageContent = () => {
  return (
    <UserLayout>
      <ProfileDetails />
    </UserLayout>
  );
};

export default ProfilePageContent;
