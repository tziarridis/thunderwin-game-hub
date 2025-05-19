
import React from 'react';
import { User } from '@/types'; 

interface AdminHeaderProps {
  user: User | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user }) => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div>
        {user ? (
          <span>Welcome, {user.email || user.username || 'Admin'}</span>
        ) : (
          <span>Loading user...</span>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
